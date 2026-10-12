'use strict'

const parseNumbers = (lineContent) => lineContent.split(' ').map(Number)

const checkSkillRequirements = (skillLevelsArray, requiredLevel) => {
  return skillLevelsArray.every(currentLevel => currentLevel >= requiredLevel)
}

const ProcessInput = (rawData) => {
  const lines = rawData.trim().split('\n')

  const firstLineValues = parseNumbers(lines[0])
  const numBooks = firstLineValues[0]
  const numSkills = firstLineValues[1]
  const minSkillLevel = firstLineValues[2]

  const bookDataCollection = []

  const parseBookEntry = (lineIndex) => {
    const [itemCost, ...skillLevels] = parseNumbers(lines[lineIndex])
    return {
      itemCost,
      skillLevels
    }
  }

  for (let bookIdx = 0; bookIdx < numBooks; bookIdx++) {
    bookDataCollection.push(parseBookEntry(bookIdx + 1))
  }

  const eligibleCosts = []
  const totalSubsets = 1 << numBooks

  for (let subsetMask = 0; subsetMask < totalSubsets; subsetMask++) {
    const currentSubsetStats = {
      totalCost: 0,
      accumulatedSkills: new Array(numSkills).fill(0)
    }

    for (let currentBookIdx = 0; currentBookIdx < numBooks; currentBookIdx++) {
      const isBookIncluded = (subsetMask & (1 << currentBookIdx)) !== 0

      if (isBookIncluded) {
        const book = bookDataCollection[currentBookIdx]
        currentSubsetStats.totalCost += book.itemCost

        for (let skillIdx = 0; skillIdx < numSkills; skillIdx++) {
          currentSubsetStats.accumulatedSkills[skillIdx] += book.skillLevels[skillIdx]
        }
      }
    }

    if (checkSkillRequirements(currentSubsetStats.accumulatedSkills, minSkillLevel)) {
      eligibleCosts.push(currentSubsetStats.totalCost)
    }
  }

  let finalMinimumCost
  if (eligibleCosts.length > 0) {
    finalMinimumCost = Math.min(...eligibleCosts)
  } else {
    finalMinimumCost = -1
  }

  console.log(finalMinimumCost)
  return finalMinimumCost
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
