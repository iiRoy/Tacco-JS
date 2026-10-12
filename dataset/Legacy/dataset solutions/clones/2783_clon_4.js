'use strict'

function processInput(rawData) {
  const lines = rawData.trim().split('\n')
  const elementCount = Number(lines[0])
  const numericalSequence = lines[1].split(' ').map(Number)

  const intermediatePoints = Array.from({ length: elementCount - 2 }, (_, index) => index + 1)
    .filter(currentIdx => {
      const priorVal = numericalSequence[currentIdx - 1]
      const centralVal = numericalSequence[currentIdx]
      const subsequentVal = numericalSequence[currentIdx + 1]

      // This condition is mathematically equivalent to:
      // (priorVal < centralVal && centralVal < subsequentVal) || (priorVal > centralVal && centralVal > subsequentVal)
      // It checks if centralVal is strictly between priorVal and subsequentVal.
      return (priorVal - centralVal) * (centralVal - subsequentVal) > 0
    })
    .length

  console.log(intermediatePoints)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
