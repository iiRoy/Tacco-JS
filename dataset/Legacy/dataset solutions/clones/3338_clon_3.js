'use strict'

const moduloConstant = 1e9 + 7

const addMod = (a, b) => (a + b) % moduloConstant
const subtractMod = (a, b) => (a - b + moduloConstant) % moduloConstant

function computeWaysToSum(numItems, targetValue, itemValues) {
  if (targetValue === 0) {
    return 1
  }

  let currentWays = new Array(targetValue + 1).fill(0)
  let cumulativeWays = Array.from({ length: numItems }, () => new Array(targetValue + 1).fill(0))

  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    for (let currentSumValue = 0; currentSumValue <= targetValue; currentSumValue++) {
      if (itemIndex === 0) {
        const canFormSum = (currentSumValue <= itemValues[itemIndex]) ? 1 : 0
        currentWays[currentSumValue] = canFormSum
        const prevCumulative = (currentSumValue > 0) ? cumulativeWays[itemIndex][currentSumValue - 1] : 0
        cumulativeWays[itemIndex][currentSumValue] = addMod(prevCumulative, currentWays[currentSumValue])
      } else {
        let waysForCurrentSum = 0
        const lowerBoundIndex = currentSumValue - itemValues[itemIndex] - 1

        if (lowerBoundIndex >= 0) {
          waysForCurrentSum = subtractMod(cumulativeWays[itemIndex - 1][currentSumValue], cumulativeWays[itemIndex - 1][lowerBoundIndex])
        } else {
          waysForCurrentSum = cumulativeWays[itemIndex - 1][currentSumValue]
        }
        currentWays[currentSumValue] = waysForCurrentSum

        const prevCumulative = (currentSumValue > 0) ? cumulativeWays[itemIndex][currentSumValue - 1] : 0
        cumulativeWays[itemIndex][currentSumValue] = addMod(prevCumulative, currentWays[currentSumValue])
      }
    }
  }
  return currentWays[targetValue]
}

function parseIntegerArray(str) {
  return str.split(' ').map(s => parseInt(s, 10))
}

function executeSolution(input) {
  const inputLines = input.split("\n")
  const parsedNK = parseIntegerArray(inputLines[0])
  const numItems = parsedNK[0]
  const targetValue = parsedNK[1]
  const itemValues = parseIntegerArray(inputLines[1])
  
  const finalResult = computeWaysToSum(numItems, targetValue, itemValues)
  console.log(finalResult)
}

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'))
