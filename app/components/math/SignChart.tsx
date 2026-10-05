"use client";

import { evaluate, parse } from "mathjs";
import { InlineMath } from "react-katex";
import { useMemo } from "react";
import "katex/dist/katex.min.css";

type SignChartProps = {
  expressions: string;
};

type CriticalPoint = {
  value: number;
  zero: boolean;
  undefined: boolean;
};

type Interval = {
  left: number | null;
  right: number | null;
  testPoint: number;
};

const EPSILON = 1e-7;

function evaluateAt(expression: string, x: number): number | null {
  try {
    const result = evaluate(expression, { x });

    if (typeof result !== "number" || !Number.isFinite(result)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

function expressionToLatex(expression: string): string {
  try {
    return parse(expression).toTex();
  } catch {
    return expression;
  }
}

function findCriticalPoints(expression: string): CriticalPoint[] {
  const points: CriticalPoint[] = [];

  const min = -100;
  const max = 100;
  const step = 0.1;

  let previousX = min;
  let previousValue = evaluateAt(expression, previousX);

  for (let x = min + step; x <= max; x += step) {
    const value = evaluateAt(expression, x);

    if (value !== null && Math.abs(value) < EPSILON) {
      points.push({
        value: x,
        zero: true,
        undefined: false,
      });
    }

    if (
      previousValue !== null &&
      value !== null &&
      ((previousValue < 0 && value > 0) ||
        (previousValue > 0 && value < 0))
    ) {
      let left = previousX;
      let right = x;
      let leftValue = previousValue;

      for (let i = 0; i < 60; i++) {
        const middle = (left + right) / 2;
        const middleValue = evaluateAt(expression, middle);

        if (middleValue === null) {
          break;
        }

        if (Math.abs(middleValue) < EPSILON) {
          left = middle;
          right = middle;
          break;
        }

        if (
          (leftValue < 0 && middleValue > 0) ||
          (leftValue > 0 && middleValue < 0)
        ) {
          right = middle;
        } else {
          left = middle;
          leftValue = middleValue;
        }
      }

      points.push({
        value: (left + right) / 2,
        zero: true,
        undefined: false,
      });
    }

    if (
      (previousValue === null && value !== null) ||
      (previousValue !== null && value === null)
    ) {
      points.push({
        value: x,
        zero: false,
        undefined: true,
      });
    }

    previousX = x;
    previousValue = value;
  }

  const unique: CriticalPoint[] = [];

  for (const point of points) {
    const existing = unique.find(
      (p) => Math.abs(p.value - point.value) < 0.05
    );

    if (existing) {
      existing.zero ||= point.zero;
      existing.undefined ||= point.undefined;
    } else {
      unique.push(point);
    }
  }

  return unique.sort((a, b) => a.value - b.value);
}

function getSign(
  expression: string,
  x: number
): "+" | "-" | "0" | "∅" {
  const value = evaluateAt(expression, x);

  if (value === null) {
    return "∅";
  }

  if (Math.abs(value) < EPSILON) {
    return "0";
  }

  return value > 0 ? "+" : "-";
}

function formatNumber(value: number): string {
  if (Math.abs(value) < EPSILON) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return Number(value.toFixed(4)).toString();
}

function createIntervals(points: CriticalPoint[]): Interval[] {
  if (points.length === 0) {
    return [
      {
        left: null,
        right: null,
        testPoint: 0,
      },
    ];
  }

  const intervals: Interval[] = [];

  intervals.push({
    left: null,
    right: points[0].value,
    testPoint: points[0].value - 1,
  });

  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i].value;
    const right = points[i + 1].value;

    intervals.push({
      left,
      right,
      testPoint: (left + right) / 2,
    });
  }

  intervals.push({
    left: points.at(-1)!.value,
    right: null,
    testPoint: points.at(-1)!.value + 1,
  });

  return intervals;
}

export default function SignChart({
  expressions,
}: SignChartProps) {
  const expressionList = useMemo(() => {
    return expressions
      .split(";")
      .map((expression) => expression.trim())
      .filter(Boolean);
  }, [expressions]);

  const chart = useMemo(() => {
    const allPoints = expressionList.flatMap((expression) =>
      findCriticalPoints(expression)
    );

    const points: CriticalPoint[] = [];

    for (const point of allPoints) {
      const existing = points.find(
        (p) => Math.abs(p.value - point.value) < 0.05
      );

      if (existing) {
        existing.zero ||= point.zero;
        existing.undefined ||= point.undefined;
      } else {
        points.push({ ...point });
      }
    }

    points.sort((a, b) => a.value - b.value);

    return {
      points,
      intervals: createIntervals(points),
    };
  }, [expressionList]);

  if (expressionList.length === 0) {
    return (
      <div className="my-4 rounded-lg border border-[var(--block-border-wrong)] bg-[var(--block-button-wrong)] p-4 text-sm text-[var(--block-border-wrong)]">
        SignChart requires at least one expression.
      </div>
    );
  }

  return (
    <div className="my-5 overflow-x-auto">
      <div className="min-w-[700px] rounded-lg bg-[var(--block-background)] p-6 shadow-sm">
        <div className="space-y-4">

          <div className="grid grid-cols-[180px_1fr] gap-4">
            <div className="font-medium">
              <InlineMath math="x" />
            </div>

            <div className="relative h-14">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-foreground" />

              {chart.points.map((point) => {
                const position = getPointPosition(
                  point.value,
                  chart.points
                );

                return (
                  <div
                    key={point.value}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${position}%`,
                    }}
                  >
                    <div
                      className={[
                        "h-4 w-4 rounded-full bg-[var(--block-background)]",
                        point.undefined
                          ? "border-2 border-dashed border-foreground"
                          : "border-2 border-foreground",
                      ].join(" ")}
                    />

                    <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap text-sm">
                      {formatNumber(point.value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {expressionList.map((expression) => (
            <div
              key={expression}
              className="grid grid-cols-[180px_1fr] gap-4"
            >
              <div className="flex items-center">
                <InlineMath
                  math={expressionToLatex(expression)}
                />
              </div>

              <SignLine
                expression={expression}
                points={chart.points}
                intervals={chart.intervals}
              />
            </div>
          ))}

          <div className="grid grid-cols-[180px_1fr] gap-4 border-t pt-4">
            <div className="flex items-center">
              <InlineMath math="x" />
            </div>

            <XSignLine
              expressions={expressionList}
              points={chart.points}
              intervals={chart.intervals}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-5 border-t pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block w-8 border-t-2 border-foreground" />
            positiv
          </span>

          <span className="flex items-center gap-2">
            <span className="inline-block w-8 border-t-2 border-dotted border-foreground" />
            negativ
          </span>

          <span>
            <strong className="text-foreground">0</strong>{" "}
            nullpunkt
          </span>

          <span>
            <strong className="text-foreground">∅</strong>{" "}
            udefinert
          </span>
        </div>
      </div>
    </div>
  );
}

function SignLine({
  expression,
  points,
  intervals,
}: {
  expression: string;
  points: CriticalPoint[];
  intervals: Interval[];
}) {
  return (
    <div className="relative h-10">
      {intervals.map((interval, index) => {
        const sign = getSign(
          expression,
          interval.testPoint
        );

        const start =
          index === 0
            ? 0
            : getPointPosition(
                points[index - 1].value,
                points
              );

        const end =
          index === intervals.length - 1
            ? 100
            : getPointPosition(
                points[index].value,
                points
              );

        return (
          <div
            key={index}
            className={[
              "absolute top-1/2 -translate-y-1/2",
              sign === "-"
                ? "border-t-2 border-dotted border-foreground"
                : "border-t-2 border-foreground",
            ].join(" ")}
            style={{
              left: `${start}%`,
              width: `${end - start}%`,
            }}
          />
        );
      })}

      {points.map((point) => {
        const sign = getSign(expression, point.value);
        const position = getPointPosition(
          point.value,
          points
        );

        if (sign === "0") {
          return (
            <span
              key={point.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--block-background)] px-1 text-sm font-medium"
              style={{
                left: `${position}%`,
              }}
            >
              0
            </span>
          );
        }

        if (sign === "∅") {
          return (
            <span
              key={point.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--block-background)] px-1 text-sm font-medium"
              style={{
                left: `${position}%`,
              }}
            >
              ∅
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}

function XSignLine({
  expressions,
  points,
  intervals,
}: {
  expressions: string[];
  points: CriticalPoint[];
  intervals: Interval[];
}) {
  return (
    <div className="relative h-10">
      {intervals.map((interval, index) => {
        const signs = expressions.map((expression) =>
          getSign(expression, interval.testPoint)
        );

        let combinedSign: "+" | "-" | "0" | "∅" = "+";

        if (signs.some((sign) => sign === "∅")) {
          combinedSign = "∅";
        } else if (signs.some((sign) => sign === "0")) {
          combinedSign = "0";
        } else {
          const negativeCount = signs.filter(
            (sign) => sign === "-"
          ).length;

          combinedSign =
            negativeCount % 2 === 0 ? "+" : "-";
        }

        const start =
          index === 0
            ? 0
            : getPointPosition(
                points[index - 1].value,
                points
              );

        const end =
          index === intervals.length - 1
            ? 100
            : getPointPosition(
                points[index].value,
                points
              );

        return (
          <div
            key={index}
            className={[
              "absolute top-1/2 -translate-y-1/2",
              combinedSign === "-"
                ? "border-t-2 border-dotted border-foreground"
                : "border-t-2 border-foreground",
            ].join(" ")}
            style={{
              left: `${start}%`,
              width: `${end - start}%`,
            }}
          />
        );
      })}

      {points.map((point) => {
        const signs = expressions.map((expression) =>
          getSign(expression, point.value)
        );

        const position = getPointPosition(
          point.value,
          points
        );

        if (signs.some((sign) => sign === "∅")) {
          return (
            <span
              key={point.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--block-background)] px-1 text-sm font-medium"
              style={{
                left: `${position}%`,
              }}
            >
              ∅
            </span>
          );
        }

        if (signs.some((sign) => sign === "0")) {
          return (
            <span
              key={point.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--block-background)] px-1 text-sm font-medium"
              style={{
                left: `${position}%`,
              }}
            >
              0
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}

function getPointPosition(
  value: number,
  points: CriticalPoint[]
): number {
  if (points.length === 0) {
    return 50;
  }

  if (points.length === 1) {
    return 50;
  }

  const min = points[0].value;
  const max = points.at(-1)!.value;

  if (max === min) {
    return 50;
  }

  const padding = 12;

  return (
    padding +
    ((value - min) / (max - min)) *
      (100 - padding * 2)
  );
}
