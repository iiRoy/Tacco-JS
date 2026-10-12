'use strict'

const processInput = rawData => {
  const trimmedInput = rawData.trim()
  const limitVal = parseInt(trimmedInput, 10)

  let resultNum = 0
  let maxDivCount = -1

  const calculateDivisibilityCount = (numberToCheck) => {
    let count = 0
    let tempVal = numberToCheck
    const divisor = 2 // Introduce a helper constant for the divisor

    // Rewriting the loop condition: continue while even and positive
    while (tempVal > 0 && tempVal % divisor === 0) {
      tempVal /= divisor
      count++
    }
    return count
  }

  for (let currentVal = 1; currentVal <= limitVal; currentVal++) {
    // Utilize the extracted helper function
    const currentDivCount = calculateDivisibilityCount(currentVal)

    // Refactor the update logic slightly
    if (currentDivCount > maxDivCount) {
      resultNum = currentVal
      maxDivCount = currentDivCount
    }
  }

  console.log(resultNum)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
