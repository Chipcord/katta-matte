import { Exercises } from "@/app/components/Exercises"

import exercise1 from "@/content/exercises/1T/1/1.json"
import exercise2 from "@/content/exercises/1T/1/2.json"

const exercises = [...exercise1, ...exercise2]

export default function Page() {
  return (
    <div className="max-w-5xl h-full p-10">
      <Exercises exercises={exercises} />
    </div>
  )
}
