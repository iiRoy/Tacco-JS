'use strict'

const solveProblem = (sourceData) => {
  const processedLines = sourceData.trim().split('\n')
  const numericalValues = processedLines[1].split(' ').map(str => Number(str))

  if (numericalValues.length < 3) {
    return 0
  }

  const result = numericalValues.reduce((counter, currentElement, currentIndex, entireArray) => {
    if (currentIndex > 0 && currentIndex < entireArray.length - 1) {
      const precedingElement = entireArray[currentIndex - 1]
      const succeedingElement = entireArray[currentIndex + 1]

      const firstDifference = currentElement - precedingElement
      const secondDifference = currentElement - succeedingElement

      if (firstDifference * secondDifference < 0) {
        return counter + 1
      }
    }
    return counter
  }, 0)

  return result
}

console.log(solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8')))