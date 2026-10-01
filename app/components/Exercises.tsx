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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(
    null
  );
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
          bg-[var(--code-background)]
        "
      >
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Resultat
        </h2>

        <p className="mt-4 text-[var(--foreground)]">
          Du fikk {score} av 5 riktige.
        </p>

        <button
          type="button"
          onClick={handleRetry}
          className="
            cursor-pointer
            mt-4
            rounded-md
            bg-[var(--button)]
            border
            border-[var(--border)]
            px-4
            py-2
            text-[var(--foreground)]
            hover:bg-[var(--button-hover)]
          "
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
        bg-[var(--code-background)]
      "
    >
      <h2 className="text-2xl font-bold text-[var(--foreground)]">
        (KI GENERERT) Oppgave {exerciseIndex + 1} av 5
      </h2>

      <p
        className="mt-4 text-[var(--foreground)] [&_.katex]:text-[var(--code-foreground)]"
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
                cursor-pointer
                p-3
                text-left
                rounded-md
                border
                border-[var(--border)]
                text-[var(--code-foreground)]

                ${
                  !isAnswered
                    ? "bg-[var(--button)] hover:bg-[var(--button-hover)]"
                    : ""
                }

                ${
                  isAnswered && isCorrectAnswer
                    ? "bg-green-100 dark:bg-green-900/30"
                    : ""
                }

                ${
                  isAnswered &&
                  isSelected &&
                  !isCorrectAnswer
                    ? "bg-red-100 dark:bg-red-900/30"
                    : ""
                }
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
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            `}
          >
            {isCorrect ? "Riktig!" : "Feil!"}
          </p>

          <button
            type="button"
            onClick={handleNext}
            className="
              cursor-pointer
              mt-4
              rounded-md
              bg-[var(--button)]
              border
              border-[var(--border)]
              px-4
              py-2
              text-[var(--foreground)]
              hover:bg-[var(--button-hover)]
            "
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
