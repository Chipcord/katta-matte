"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type GraphProps = {
  expression: string;
  xMin?: number;
  xMax?: number;
};

type ThemeColors = {
  foreground: string;
  border: string;
  link: string;
};

function getThemeColors(): ThemeColors {
  const styles = getComputedStyle(document.documentElement);

  return {
    foreground: styles.getPropertyValue("--foreground").trim(),
    border: styles.getPropertyValue("--border").trim(),
    link: styles.getPropertyValue("--link").trim(),
  };
}

function evaluateExpression(expression: string, x: number): number {
  const jsExpression = expression
    .replace(/\^/g, "**")
    .replace(/\bsin\b/g, "Math.sin")
    .replace(/\bcos\b/g, "Math.cos")
    .replace(/\btan\b/g, "Math.tan")
    .replace(/\bsqrt\b/g, "Math.sqrt")
    .replace(/\babs\b/g, "Math.abs")
    .replace(/\bexp\b/g, "Math.exp")
    .replace(/\blog\b/g, "Math.log");

  const fn = new Function(
    "x",
    `"use strict"; return ${jsExpression};`
  );

  return Number(fn(x));
}

export default function Graph({
  expression,
  xMin = -10,
  xMax = 10,
}: GraphProps) {
  const [colors, setColors] = useState<ThemeColors | null>(null);

  useEffect(() => {
    setColors(getThemeColors());
  }, []);

  const points = 500;

  const x: number[] = [];
  const y: number[] = [];

  for (let i = 0; i <= points; i++) {
    const value =
      xMin + ((xMax - xMin) * i) / points;

    try {
      const result = evaluateExpression(expression, value);

      if (Number.isFinite(result)) {
        x.push(value);
        y.push(result);
      } else {
        x.push(value);
        y.push(NaN);
      }
    } catch {
      x.push(value);
      y.push(NaN);
    }
  }

  const data: Data[] = [
    {
      x,
      y,
      type: "scatter",
      mode: "lines",
      line: {
        width: 3,
        color: colors?.link,
      },
      name: `f(x) = ${expression}`,
    },
  ];

  const layout: Partial<Layout> = {
    autosize: true,
    height: 500,

    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",

    font: {
      color: colors?.foreground,
    },

    margin: {
      l: 60,
      r: 20,
      t: 30,
      b: 50,
    },

    xaxis: {
      gridcolor: colors?.border,
      zeroline: true,
      zerolinecolor: colors?.foreground,
      zerolinewidth: 2,
    },

    yaxis: {
      gridcolor: colors?.border,
      zeroline: true,
      zerolinecolor: colors?.foreground,
      zerolinewidth: 2,
    },
  };

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
  };

  if (!colors) {
    return null;
  }

  return (
    <div className="not-prose my-8 w-full">
      <Plot
        data={data}
        layout={layout}
        config={config}
        useResizeHandler
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}
