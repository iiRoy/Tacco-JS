'use strict'

const primeModulus = 1e9 + 7

function addMod(val1, val2) {
  return (val1 + val2) % primeModulus
}

function subMod(val1, val2) {
  return (val1 - val2 + primeModulus) % primeModulus
}

function calculateCombinations(numChildren, totalCandies, candyLimits) {
  if (totalCandies === 0) {
    return 1
  }

  // currentDP will store dp[j] for the current childIdx
  let currentDP = new Array(totalCandies + 1).fill(0)
  // cumulativeSums[childIdx][currentCandies] stores prefix sums for all childIdx
  let cumulativeSums = Array.from({ length: numChildren }, () => new Array(totalCandies + 1).fill(0))

  for (let childIdx = 0; childIdx < numChildren; childIdx++) {
    const currentChildCandyLimit = candyLimits[childIdx]
    for (let currentCandies = 0; currentCandies <= totalCandies; currentCandies++) {
      if (childIdx === 0) {
        // Base case for the first child
        const isWithinLimit = currentCandies <= currentChildCandyLimit
        currentDP[currentCandies] = isWithinLimit ? 1 : 0
      } else {
        // DP transition for subsequent children
        const prevChildPrefixSums = cumulativeSums[childIdx - 1]
        const upperSumTerm = prevChildPrefixSums[currentCandies]

        const effectiveLowerBoundIndex = currentCandies - currentChildCandyLimit - 1
        const lowerSumTerm = (effectiveLowerBoundIndex >= 0) ? prevChildPrefixSums[effectiveLowerBoundIndex] : 0

        currentDP[currentCandies] = subMod(upperSumTerm, lowerSumTerm)
      }

      // Calculate cumulative sum for the current childIdx and currentCandies
      const prevCumulativeVal = (currentCandies > 0) ? cumulativeSums[childIdx][currentCandies - 1] : 0
      cumulativeSums[childIdx][currentCandies] = addMod(prevCumulativeVal, currentDP[currentCandies])
    }
  }
  return currentDP[totalCandies]
}

function processInput(rawData) {
  const inputLines = rawData.split("\n")
  const nkValues = inputLines[0].split(' ').map(val => parseInt(val, 10))
  const numChildren = nkValues[0]
  const totalCandies = nkValues[1]
  const candyLimits = inputLines[1].split(' ').map(val => parseInt(val, 10))

  const finalResult = calculateCombinations(numChildren, totalCandies, candyLimits)
  console.log(finalResult)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
