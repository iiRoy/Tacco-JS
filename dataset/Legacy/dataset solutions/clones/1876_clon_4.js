'use strict'

const processInputData = (rawData) => {
  const dataLines = rawData.trim().split('\n')
  const [bookCount, skillCount, requiredSkillLevel] = dataLines[0].split(' ').map(Number)
  const allBookDetails = []

  for (let k = 1; k <= bookCount; k++) {
    allBookDetails.push(dataLines[k].split(' ').map(Number))
  }
  return { bookCount, skillCount, requiredSkillLevel, allBookDetails }
}

const calculateMinimumCost = (processedData) => {
  const { bookCount, skillCount, requiredSkillLevel, allBookDetails } = processedData

  let overallMinPrice = Infinity

  const exploreCombinations = (
    currentBookIndex,
    accumulatedPrice,
    accumulatedSkillLevels
  ) => {
    if (currentBookIndex === bookCount) {
      const allRequirementsMet = accumulatedSkillLevels.every(
        (level) => level >= requiredSkillLevel
      )

      if (allRequirementsMet) {
        overallMinPrice = Math.min(overallMinPrice, accumulatedPrice)
      }
      return
    }

    // Option 1: Exclude the current book
    exploreCombinations(
      currentBookIndex + 1,
      accumulatedPrice,
      accumulatedSkillLevels
    )

    // Option 2: Include the current book
    const currentBookInfo = allBookDetails[currentBookIndex]
    const bookCost = currentBookInfo[0]
    const bookSkillValues = currentBookInfo.slice(1)

    const nextAccumulatedSkillLevels = accumulatedSkillLevels.map(
      (currentSum, skillIdx) => currentSum + bookSkillValues[skillIdx]
    )

    exploreCombinations(
      currentBookIndex + 1,
      accumulatedPrice + bookCost,
      nextAccumulatedSkillLevels
    )
  }

  const initialSkillSums = new Array(skillCount).fill(0)
  exploreCombinations(0, 0, initialSkillSums)

  return overallMinPrice === Infinity ? -1 : overallMinPrice
}

const entryPoint = (inputString) => {
  const parsedData = processInputData(inputString)
  const finalResult = calculateMinimumCost(parsedData)
  console.log(finalResult)
  return finalResult
}

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'))
