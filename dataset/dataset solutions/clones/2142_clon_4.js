const obtainRawData = () => {
  const sampleData = `1000000000 141421 173205`
  const sourceContent = sampleData || require('fs').readFileSync('/dev/stdin', 'utf8')

  // Divergent syntax: Use functional `flatMap` to process lines and tokens
  return sourceContent.split('\n').flatMap(lineSegment => lineSegment.split(' ')).map(numericToken => +numericToken)
}

const recursiveProductSequence = (limitValue, counterIndex = 1, currentProduct = 1) => {
  if (counterIndex > limitValue) {
    return currentProduct
  }
  // The specific console.log behavior from the original must be replicated
  console.log(currentProduct)
  // Divergent syntax: Recursive call instead of an imperative loop
  return recursiveProductSequence(limitValue, counterIndex + 1, currentProduct * counterIndex)
}

const computeBinomialCoefficient = (totalItems, chosenItems) => {
  const upperProduct = recursiveProductSequence(totalItems)
  const lowerProductA = recursiveProductSequence(chosenItems)
  const lowerProductB = recursiveProductSequence(totalItems - chosenItems)

  // This will produce Infinity if factorials overflow, matching original behavior
  return upperProduct / (lowerProductA * lowerProductB)
}

;((computationInitiator) => {
  const processedParameters = obtainRawData()
  const upperBound = processedParameters[0]
  const exclusionA = processedParameters[1]
  const exclusionB = processedParameters[2]

  // Divergent strategy: Recursive function for summation instead of an imperative loop
  const calculateTotalCombinations = (currentIteration, totalLimit, skipA, skipB, runningSum) => {
    if (currentIteration > totalLimit) {
      return runningSum
    }

    let addition = 0
    // Divergent syntax: Conditional check is embedded within the recursive logic
    if (currentIteration !== skipA && currentIteration !== skipB) {
      addition = computeBinomialCoefficient(totalLimit, currentIteration)
    }

    return calculateTotalCombinations(currentIteration + 1, totalLimit, skipA, skipB, runningSum + addition)
  }

  const cumulativeResult = calculateTotalCombinations(1, upperBound, exclusionA, exclusionB, 0)

  const moduloConstant = Math.pow(10, 9) + 7
  console.log(cumulativeResult % moduloConstant)
})()