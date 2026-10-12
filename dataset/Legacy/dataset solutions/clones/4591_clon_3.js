'use strict'

const checkAllEven = (numX, numY, numZ) => {
  return numX % 2 === 0 && numY % 2 === 0 && numZ % 2 === 0
}

const ProcessInput = (rawData) => {
  const parsedValues = rawData.trim().split(' ')
  let valA = parseInt(parsedValues[0], 10)
  let valB = parseInt(parsedValues[1], 10)
  let valC = parseInt(parsedValues[2], 10)

  let finalCount = 0
  const HALF_DIVISOR = 2

  if (valA === valB && valB === valC && checkAllEven(valA, valB, valC)) {
    finalCount = -1
  } else {
    for (let iterationNum = 1; checkAllEven(valA, valB, valC); iterationNum++) {
      const currentValues = [valA, valB, valC]

      const nextValA = currentValues[1] / HALF_DIVISOR + currentValues[2] / HALF_DIVISOR
      const nextValB = currentValues[0] / HALF_DIVISOR + currentValues[2] / HALF_DIVISOR
      const nextValC = currentValues[0] / HALF_DIVISOR + currentValues[1] / HALF_DIVISOR

      valA = nextValA
      valB = nextValB
      valC = nextValC

      finalCount = iterationNum
    }
  }

  console.log(finalCount)
  return finalCount
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
