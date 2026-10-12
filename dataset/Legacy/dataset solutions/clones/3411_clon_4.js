'use strict'

const computeAggregate = (rawContent) => {
  const dataLines = rawContent.split('\n').slice(1).map(Number)
  const peakValue = Math.max(...dataLines)
  const overallSum = dataLines.reduce((total, current) => total + current, 0)
  const finalAnswer = overallSum - (peakValue / 2)
  console.log(finalAnswer)
}

computeAggregate(require('fs').readFileSync('/dev/stdin', 'utf8'))
