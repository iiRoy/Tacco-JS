'use strict'

function processInput(rawData) {
  const trimmedInput = rawData.trim()
  const stringValues = trimmedInput.split(' ')
  const parsedValues = stringValues.map(str => parseInt(str, 10))

  const rangeCount = parsedValues[0]
  const centerValue = parsedValues[1]

  const isSingleElementRange = (rangeCount === 1)

  if (isSingleElementRange) {
    console.log(String(centerValue))
    return
  }

  let resultNumbers = []

  const lowerBoundInclusive = centerValue - rangeCount + 1
  const upperBoundInclusive = centerValue + rangeCount - 1

  for (let currentNum = lowerBoundInclusive; currentNum <= upperBoundInclusive; currentNum++) {
    resultNumbers.push(currentNum)
  }

  console.log(resultNumbers.join(' '))
}

const inputFilePath = '/dev/stdin'
const fileContent = require('fs').readFileSync(inputFilePath, 'utf8')
processInput(fileContent)
