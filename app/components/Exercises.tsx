"use client";

import { useEffect, useState } from "react";
import katex from "katex";

type Exercise = {
  question: string;
  options: string[];
  answer: number;
};

function renderMath(text: string) {
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, math) =>
      katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
      })
    )
    .replace(/\$(.*?)\$/g, (_, math) =>
      katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
      })
    );
}

export function Exercises({
  exercises,
}: {
  exercises: Exercise[];
}) {
  if (exercises.length < 5) {
    return null;
  }

  return <ExerciseQuiz exercises={exercises} />;
}

function ExerciseQuiz({
  exercises,
}: {
  exercises: Exercise[];
}) {
  const [quizExercises, setQuizExercises] = useState<Exercise[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setQuizExercises(getRandomExercises(exercises));
  }, [exercises]);

  if (quizExercises.length === 0) {
    return null;
  }

  const exercise = quizExercises[exerciseIndex];

  if (!exercise) {
    return null;
  }

  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === exercise.answer;

  function handleAnswer(index: number) {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer(index);

    if (index === exercise.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function handleNext() {
    if (exerciseIndex === 4) {
      setFinished(true);
      return;
    }

    setExerciseIndex((currentIndex) => currentIndex + 1);
    setSelectedAnswer(null);
  }

  function handleRetry() {
    setQuizExercises(getRandomExercises(exercises));
    setExerciseIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <section
        className="
          mx-4
          sm:mx-6
          lg:mx-10
          p-5
          rounded-lg
          bg-[var(--block-background)]
        "
      >
        <h2 className="text-2xl font-bold text-[var(--block-foreground)]">
          Resultat
        </h2>

        <p className="mt-4 text-[var(--block-foreground)]">
          Du fikk {score} av 5 riktige.
        </p>

        <button
          type="button"
          onClick={handleRetry}
          className="block-button mt-4 cursor-pointer"
        >
          Prøv igjen
        </button>
      </section>
    );
  }

  return (
    <section
      className="
        mx-4
        sm:mx-6
        lg:mx-10
        p-5
        rounded-lg
        bg-[var(--block-background)]
      "
    >
      <h2 className="text-2xl font-bold text-[var(--block-foreground)]">
        Oppgave {exerciseIndex + 1} av 5{" "}
        <span className="opacity-20 italic text-lg font-medium">
          * oppgavene er delvis KI genererte
        </span>
      </h2>

      <p
        className="
          mt-4
          text-[var(--block-foreground)]
          [&_.katex]:text-[var(--block-foreground-accent)]
        "
        dangerouslySetInnerHTML={{
          __html: renderMath(exercise.question),
        }}
      />

      <div className="mt-6 flex flex-col gap-3">
        {exercise.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = exercise.answer === index;

          return (
            <button
              key={index}
              type="button"
              disabled={isAnswered}
              onClick={() => handleAnswer(index)}
              className={`
                block-button
                cursor-pointer
                text-left

                ${
                  isAnswered && isCorrectAnswer
                    ? `
                      bg-[var(--block-button-right)]
                      border-[var(--block-border-right)]
                    `
                    : ""
                }

                ${
                  isAnswered &&
                  isSelected &&
                  !isCorrectAnswer
                    ? `
                      bg-[var(--block-button-wrong)]
                      border-[var(--block-border-wrong)]
                    `
                    : ""
                }

                [&_.katex]:text-[var(--block-foreground-accent)]
              `}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(option, {
                  throwOnError: false,
                }),
              }}
            />
          );
        })}
      </div>

      {isAnswered && (
        <>
          <p
            className={`
              mt-4
              font-medium
              ${
                isCorrect
                  ? "text-[var(--block-right)]"
                  : "text-[var(--block-wrong)]"
              }
            `}
          >
            {isCorrect ? "Riktig!" : "Feil!"}
          </p>

          <button
            type="button"
            onClick={handleNext}
            className="block-button mt-4 cursor-pointer"
          >
            {exerciseIndex === 4 ? "Se resultat" : "Neste oppgave"}
          </button>
        </>
      )}
    </section>
  );
}

function getRandomExercises(exercises: Exercise[]) {
  return [...exercises]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}
