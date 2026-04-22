'use strict'

const displayResult = (valueToOutput) => console.log(valueToOutput)

const acquireSourceData = () => {
  const fileSystemUtility = require('node:fs')
  const inputPath = '/dev/stdin'
  const characterEncoding = 'utf-8'
  return fileSystemUtility.readFileSync(inputPath, characterEncoding)
}

const computeSolution = (sourceInputText) => {
  const targetValue = +(sourceInputText.replace(/\s+$/, ''))

  let outcomeString = ':-('

  // The original logic searches for the smallest integer 'i' (starting from 1)
  // such that Math.floor(i * 1.08) equals the input N.
  // This implies the mathematical relationship: N <= i * 1.08 < N + 1.
  // From this, we can deduce: i >= N / 1.08.
  // The smallest integer 'i' that satisfies this is Math.ceil(N / 1.08).
  // Additionally, 'i' must be at least 1 as per the original loop's starting condition.
  const candidateFactor = Math.max(1, Math.ceil(targetValue / 1.08))

  // We verify if this candidate factor, when multiplied by 1.08 and floored,
  // yields the original target value.
  // Using the bitwise NOT operator (~~) as an alternative to Math.floor for positive numbers,
  // offering a syntactically divergent approach.
  const verifiedOutput = ~~(candidateFactor * 1.08)

  if (verifiedOutput === targetValue) {
    outcomeString = candidateFactor
  }

  return outcomeString
}

displayResult(computeSolution(acquireSourceData()))