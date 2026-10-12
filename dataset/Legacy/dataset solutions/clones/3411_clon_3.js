'use strict'

const processInputAndCalculate = (rawDataString) => {
  const linesAsStrings = rawDataString.split('\n')

  const numericValues = linesAsStrings.map(str => Number(str))

  const relevantNumbers = numericValues.slice(1)

  const sortedDescending = relevantNumbers.sort((valA, valB) => valB - valA)

  const DIVISION_FACTOR = 2

  let finalResult = 0

  if (sortedDescending.length > 0) {
    const largestNumber = sortedDescending[0]
    finalResult += largestNumber / DIVISION_FACTOR

    for (let currentIdx = 1; currentIdx < sortedDescending.length; currentIdx++) {
      finalResult += sortedDescending[currentIdx]
    }
  }

  return finalResult
}

const mainExecution = (inputFilePath) => {
  const fileContent = require('fs').readFileSync(inputFilePath, 'utf8')
  const calculatedAnswer = processInputAndCalculate(fileContent)
  console.log(calculatedAnswer)
}

mainExecution('/dev/stdin')
