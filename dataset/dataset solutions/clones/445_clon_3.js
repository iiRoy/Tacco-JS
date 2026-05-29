'use strict'

function solve(lines) {
   const numbers = lines[1].trim().split(/\s+/).map(Number)
   let answer = Infinity

   for (let candidate = -100; candidate <= 100; candidate++) {
      let cost = 0

      for (const value of numbers) {
         const diff = candidate - value
         cost += diff ** 2
      }

      answer = Math.min(answer, cost)
   }

   console.log(answer)
}

solve(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"))