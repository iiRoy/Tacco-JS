'use strict'

const parseNumericValue = (valueString) => {
  return Number(valueString)
}

function processInputData(rawInputString) {
  const trimmedInput = rawInputString.trim()
  const inputParts = trimmedInput.split(' ')

  const growthRate = parseNumericValue(inputParts[0])
  const decayOffset = parseNumericValue(inputParts[1])
  const initialPopulationTerm = parseNumericValue(inputParts[2])

  const generatedSequence = []
  let previousTermInSequence = initialPopulationTerm

  const totalTermsToOutput = 10

  for (let sequenceIndex = 0; sequenceIndex < totalTermsToOutput; sequenceIndex++) {
    const currentCalculatedTerm = growthRate * previousTermInSequence - decayOffset
    generatedSequence.push(currentCalculatedTerm)
    previousTermInSequence = currentCalculatedTerm
  }

  console.log(generatedSequence.join('\n'))
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'))
