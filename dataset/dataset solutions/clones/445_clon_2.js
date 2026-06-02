'use strict'

function Solve(inputLines) {
   let values = inputLines[1].split(' ')
   let results = []

   for (let candidate = -100; candidate <= 100; candidate++) {
      let total = 0

      for (let index = 0; index < values.length; index++) {
         let diff = candidate - values[index]
         total += diff * diff
      }

      results.push(total)
   }

   console.log(results.sort((x, y) => x - y)[0])
}

Solve(require("fs").readFileSync("/dev/stdin", "utf8").trim().replace('\n', '').split("\n"));