"use client";

import { evaluate, parse } from "mathjs";
import { InlineMath } from "react-katex";
import { useMemo } from "react";
import "katex/dist/katex.min.css";

type RationalSignChartProps = {
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

function evaluateAt(
  expression: string,
  x: number
): number | null {
  try {
    const result = evaluate(expression, { x });

    if (
      typeof result !== "number" ||
      !Number.isFinite(result)
    ) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

function expressionToLatex(
  expression: string
): string {
  try {
    return parse(expression).toTex();
  } catch {
    return expression;
  }
}

function findDenominators(
  expression: string
): string[] {
  const denominators: string[] = [];

  try {
    const node = parse(expression);

    node.traverse((child) => {
      if (
        child.isOperatorNode &&
        child.op === "/" &&
        child.args.length === 2
      ) {
        denominators.push(
          child.args[1].toString()
        );
      }
    });
  } catch {
  }

  return denominators;
}

function findRoots(
  expression: string
): number[] {
  const roots: number[] = [];

  const min = -100;
  const max = 100;
  const step = 0.1;

  let previousX = min;

  let previousValue = evaluateAt(
    expression,
    previousX
  );

  for (
    let x = min + step;
    x <= max + EPSILON;
    x += step
  ) {
    const value = evaluateAt(
      expression,
      x
    );

    if (
      value !== null &&
      Math.abs(value) < EPSILON
    ) {
      roots.push(x);
    }

    if (
      previousValue !== null &&
      value !== null &&
      previousValue * value < 0
    ) {
      const root = bisectRoot(
        expression,
        previousX,
        x
      );

      if (root !== null) {
        roots.push(root);
      }
    }

    previousX = x;
    previousValue = value;
  }

  return mergeRoots(roots);
}

function bisectRoot(
  expression: string,
  left: number,
  right: number
): number | null {
  let leftValue = evaluateAt(
    expression,
    left
  );

  if (leftValue === null) {
    return null;
  }

  for (let i = 0; i < 80; i++) {
    const middle =
      (left + right) / 2;

    const middleValue =
      evaluateAt(
        expression,
        middle
      );

    if (middleValue === null) {
      return null;
    }

    if (
      Math.abs(middleValue) <
      EPSILON
    ) {
      return middle;
    }

    if (
      leftValue * middleValue <
      0
    ) {
      right = middle;
    } else {
      left = middle;
      leftValue = middleValue;
    }
  }

  return (left + right) / 2;
}

function mergeRoots(
  roots: number[]
): number[] {
  const unique: number[] = [];

  for (const root of roots) {
    const existing = unique.find(
      (value) =>
        Math.abs(value - root) <
        0.00001
    );

    if (
      existing === undefined
    ) {
      unique.push(root);
    }
  }

  return unique.sort(
    (a, b) => a - b
  );
}

function findCriticalPoints(
  expression: string,
  isDenominator = false
): CriticalPoint[] {
  const points: CriticalPoint[] = [];

  for (const root of findRoots(
    expression
  )) {
    points.push({
      value: root,

      undefined: isDenominator,
    });
  }

  for (const denominator of findDenominators(
    expression
  )) {
    for (const root of findRoots(
      denominator
    )) {
      points.push({
        value: root,
        zero: false,
        undefined: true,
      });
    }
  }

  return mergeCriticalPoints(
    points
  );
}

function mergeCriticalPoints(
  points: CriticalPoint[]
): CriticalPoint[] {
  const unique: CriticalPoint[] = [];

  for (const point of points) {
    const existing = unique.find(
      (p) =>
        Math.abs(
          p.value - point.value
        ) < 0.00001
    );

    if (existing) {
      existing.zero ||=
        point.zero;

      existing.undefined ||=
        point.undefined;
    } else {
      unique.push({
        ...point,
      });
    }
  }

  return unique.sort(
    (a, b) => a.value - b.value
  );
}

function getSign(
  expression: string,
  x: number
): "+" | "-" | "0" | "∅" {
  const value = evaluateAt(
    expression,
    x
  );

  if (value === null) {
    return "∅";
  }

  if (
    Math.abs(value) <
    EPSILON
  ) {
    return "0";
  }

  return value > 0 ? "+" : "-";
}

function formatNumber(
  value: number
): string {
  if (
    Math.abs(value) <
    EPSILON
  ) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return Number(
    value.toFixed(4)
  ).toString();
}

function createIntervals(
  points: CriticalPoint[]
): Interval[] {
  if (points.length === 0) {
    return [
      {
        left: null,
        right: null,
        testPoint: 0,
      },
    ];
  }

  const intervals: Interval[] =
    [];

  intervals.push({
    left: null,
    right: points[0].value,
    testPoint:
      points[0].value - 1,
  });

  for (
    let i = 0;
    i < points.length - 1;
    i++
  ) {
    const left =
      points[i].value;

    const right =
      points[i + 1].value;

    intervals.push({
      left,
      right,
      testPoint:
        (left + right) / 2,
    });
  }

  intervals.push({
    left:
      points.at(-1)!.value,
    right: null,
    testPoint:
      points.at(-1)!.value + 1,
  });

  return intervals;
}

export default function RationalSignChart({
  expressions,
}: RationalSignChartProps) {
  const expressionList = useMemo(() => {
    return expressions
      .split(";")
      .map((expression) =>
        expression.trim()
      )
      .filter(Boolean);
  }, [expressions]);

  const chart = useMemo(() => {
    const allPoints =
      expressionList.flatMap(
        (expression, index) =>
          findCriticalPoints(
            expression,
            index > 0
          )
      );

    const points =
      mergeCriticalPoints(
        allPoints
      );

    return {
      points,
      intervals:
        createIntervals(points),
    };
  }, [expressionList]);

  if (
    expressionList.length === 0
  ) {
    return (
      <div className="my-4 rounded-lg border border-(--block-border-wrong) bg-(--block-button-wrong) p-4 text-sm text-(--block-border-wrong)">
        RationalSignChart requires at
        least one expression.
      </div>
    );
  }

  return (
    <div className="my-5 overflow-x-auto">
      <div className="min-w-175 rounded-lg bg-(--block-background) p-5 shadow-sm">
        <div className="space-y-2">

          <div className="grid grid-cols-[240px_1fr] gap-4">
            <div className="py-4 font-medium">
              <InlineMath math="x" />
            </div>

            <div className="relative h-14">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-foreground" />

              {chart.points.map(
                (point) => {
                  const position =
                    getPointPosition(
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
                          "h-4 w-4 rounded-full bg-(--block-background)",
                          point.undefined
                            ? "border-2 border-dashed border-foreground"
                            : "border-2 border-foreground",
                        ].join(" ")}
                      />

                      <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap text-sm">
                        {formatNumber(
                          point.value
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {expressionList.map(
            (expression) => (
              <div
                key={expression}
                className="grid grid-cols-[240px_1fr] gap-4"
              >
                <div className="flex items-center">
                  <InlineMath
                    math={expressionToLatex(
                      expression
                    )}
                  />
                </div>

                <SignLine
                  expression={expression}
                  points={chart.points}
                  intervals={
                    chart.intervals
                  }
                />
              </div>
            )
          )}

          <div className="grid grid-cols-[240px_1fr] gap-4 border-t pt-4">
            <div className="flex items-center">
              <InlineMath
                math={getDivisionLatex(
                  expressionList
                )}
              />
            </div>

            <DivisionSignLine
              expressions={
                expressionList
              }
              points={chart.points}
              intervals={
                chart.intervals
              }
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 border-t pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block w-8 border-t-2 border-foreground" />
            positiv
          </span>

          <span className="flex items-center gap-2">
            <span className="inline-block w-8 border-t-2 border-dotted border-foreground" />
            negativ
          </span>

          <span>
            <strong className="text-foreground">
              0
            </strong>{" "}
            nullpunkt
          </span>

          <span>
            <strong className="text-foreground">
              &gt;&lt;
            </strong>{" "}
            bruddpunkt
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
      {intervals.map(
        (interval, index) => {
          const sign = getSign(
            expression,
            interval.testPoint
          );

          const start =
            index === 0
              ? 0
              : getPointPosition(
                  points[index - 1]
                    .value,
                  points
                );

          const end =
            index ===
            intervals.length - 1
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
        }
      )}

      {points.map((point) => {
        const sign = getSign(
          expression,
          point.value
        );

        const position =
          getPointPosition(
            point.value,
            points
          );

        if (sign === "0") {
          return (
            <span
              key={point.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--block-background) px-1 text-sm font-medium"
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
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--block-background) px-1 text-sm font-medium"
              style={{
                left: `${position}%`,
              }}
            >
              &gt;&lt;
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}

function DivisionSignLine({
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
      {intervals.map(
        (interval, index) => {
          const signs =
            expressions.map(
              (expression) =>
                getSign(
                  expression,
                  interval.testPoint
                )
            );

          const combinedSign =
            getDivisionSign(signs);

          const start =
            index === 0
              ? 0
              : getPointPosition(
                  points[index - 1]
                    .value,
                  points
                );

          const end =
            index ===
            intervals.length - 1
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
        }
      )}

      {points.map((point) => {
        const signs =
          expressions.map(
            (expression) =>
              getSign(
                expression,
                point.value
              )
          );

        const position =
          getPointPosition(
            point.value,
            points
          );

        if (
          signs.some(
            (sign) => sign === "∅"
          ) ||
          point.undefined
        ) {
          return (
            <span
              key={point.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--block-background) px-1 text-sm font-medium"
              style={{
                left: `${position}%`,
              }}
            >
              &gt;&lt;
            </span>
          );
        }

        if (
          signs.some(
            (sign) => sign === "0"
          )
        ) {
          return (
            <span
              key={point.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--block-background) px-1 text-sm font-medium"
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

function getDivisionSign(
  signs: Array<
    "+" | "-" | "0" | "∅"
  >
): "+" | "-" | "0" | "∅" {
  if (
    signs.some(
      (sign) => sign === "∅"
    )
  ) {
    return "∅";
  }

  if (
    signs.some(
      (sign) => sign === "0"
    )
  ) {
    return "0";
  }

  let negativeCount = 0;

  for (const sign of signs) {
    if (sign === "-") {
      negativeCount++;
    }
  }

  return negativeCount % 2 === 0
    ? "+"
    : "-";
}

function getDivisionLatex(
  expressions: string[]
): string {
  if (expressions.length === 0) {
    return "";
  }

  if (expressions.length === 1) {
    return expressionToLatex(
      expressions[0]
    );
  }

  let result =
    expressionToLatex(
      expressions[0]
    );

  for (
    let i = 1;
    i < expressions.length;
    i++
  ) {
    result = `\\dfrac{${result}}{${expressionToLatex(
      expressions[i]
    )}}`;
  }

  return result;
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

  const min =
    points[0].value;

  const max =
    points.at(-1)!.value;

  if (max === min) {
    return 50;
  }

  const padding = 12;

  return (
    padding +
    ((value - min) /
      (max - min)) *
      (100 - padding * 2)
  );
}
