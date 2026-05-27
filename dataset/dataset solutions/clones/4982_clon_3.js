'use strict'
const fileSystem = require('fs')

const evaluateExpression = (expressionString) => {
  return eval(expressionString)
}

const inputLines = fileSystem.readFileSync(0, 'utf8').split('\n')
const inputString = inputLines[0]
const lastIndex = inputString.length - 1

const calculateSumsRecursive = (currentIndex, currentExpression) => {
  if (currentIndex === lastIndex) {
    const finalSegment = inputString[lastIndex]
    const fullExpression = currentExpression + finalSegment
    return evaluateExpression(fullExpression)
  }

  const charToAdd = inputString[currentIndex]

  const expressionWithAddition = currentExpression + charToAdd + '+'
  const resultFromAdditionPath = calculateSumsRecursive(currentIndex + 1, expressionWithAddition)

  const expressionWithoutAddition = currentExpression + charToAdd
  const resultFromConcatenationPath = calculateSumsRecursive(currentIndex + 1, expressionWithoutAddition)

  return resultFromAdditionPath + resultFromConcatenationPath
}

const finalResult = calculateSumsRecursive(0, '')
console.log(finalResult)
