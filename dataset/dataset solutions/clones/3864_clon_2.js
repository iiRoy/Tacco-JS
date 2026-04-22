"use strict"
// Implementation derived from an external source.

const entryPoint = (rawData) => {
  // Initial data sanitization and parsing.
  rawData = rawData.trim().split("\n")
  const dataSize = parseInt(rawData[0])
  const numericValues = rawData[1].split(" ").map((item) => item * 1)

  // Calculate the running sums.
  const prefixSums = new Array(dataSize + 1).fill(0) // Array size should be N+1 for prefix sums
  numericValues.forEach((element, idx) => {
    prefixSums[idx + 1] = prefixSums[idx] + element
  })

  // Count occurrences of each running sum value.
  let occurrenceCounter = {}
  prefixSums.forEach((sumValue) => {
    if (!occurrenceCounter[sumValue]) {
      occurrenceCounter[sumValue] = 1
    } else {
      occurrenceCounter[sumValue]++
    }
  })

  let combinationCount = 0
  // Compute the number of pairs for each unique sum value.
  Object.keys(occurrenceCounter).forEach((sumKey) => {
    const freq = occurrenceCounter[sumKey]
    combinationCount += freq * (freq - 1) / 2
  })

  console.log(combinationCount)
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"))