'use strict'

function processInput(rawData) {
  const inputLines = rawData.trim().split('\n')

  const extractNumericData = (dataLines) => {
    const sequenceLength = Number(dataLines[0])
    const numberArray = dataLines[1].split(' ').map(strVal => parseInt(strVal, 10))
    return { sequenceLength, numberArray }
  }

  const { sequenceLength, numberArray } = extractNumericData(inputLines)

  let qualifyingElementCount = 0

  const isStrictlyBetweenNeighbors = (currentValue, neighborA, neighborB) => {
    const lowerBound = Math.min(neighborA, neighborB)
    const upperBound = Math.max(neighborA, neighborB)
    return currentValue > lowerBound && currentValue < upperBound
  }

  for (let currentIndex = 1; currentIndex < sequenceLength - 1; currentIndex++) {
    const currentElement = numberArray[currentIndex]
    const previousElement = numberArray[currentIndex - 1]
    const nextElement = numberArray[currentIndex + 1]

    if (isStrictlyBetweenNeighbors(currentElement, previousElement, nextElement)) {
      qualifyingElementCount++
    }
  }

  console.log(qualifyingElementCount)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
