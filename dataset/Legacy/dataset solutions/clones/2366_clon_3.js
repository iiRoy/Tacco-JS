'use strict'

const TAX_MULTIPLIER_FACTOR = 1.08
const NO_SOLUTION_MESSAGE = ':('

const calculateFlooredTaxedAmount = (baseAmount, multiplier) => {
  return Math.floor(baseAmount * multiplier)
}

const processInputData = (rawInputString) => {
  const cleanedInputString = rawInputString.trim()
  const desiredFinalAmount = parseInt(cleanedInputString, 10)

  let potentialBaseAmount = NO_SOLUTION_MESSAGE

  for (let currentIterationValue = 1; currentIterationValue <= desiredFinalAmount; currentIterationValue++) {
    const computedTaxedValue = calculateFlooredTaxedAmount(currentIterationValue, TAX_MULTIPLIER_FACTOR)

    if (computedTaxedValue === desiredFinalAmount) {
      potentialBaseAmount = currentIterationValue
    }
  }

  console.log(potentialBaseAmount)
  return potentialBaseAmount
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'))
