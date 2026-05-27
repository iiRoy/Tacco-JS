'use strict'

const processInput = (rawData) => {
  const firstLineData = rawData.split('\n')[0]
  const numericalParts = firstLineData.split(' ')

  const firstNum = Number(numericalParts[0])
  const secondNum = Number(numericalParts[1])

  const leftSideExpression = firstNum + 1
  const rightSideComparison = secondNum * 2

  if (leftSideExpression >= rightSideComparison) {
    console.log('YES')
  } else {
    console.log('NO')
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
