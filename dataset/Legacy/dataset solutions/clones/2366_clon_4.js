'use strict'

const processInput = (rawText) => {
  const targetValue = Number.parseInt(rawText.trim(), 10)
  let finalOutcome = ':('

  const potentialCandidate = Math.ceil(targetValue / 1.08)

  if (Math.floor(potentialCandidate * 1.08) === targetValue) {
    finalOutcome = potentialCandidate
  }

  console.log(finalOutcome)
  return finalOutcome
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
