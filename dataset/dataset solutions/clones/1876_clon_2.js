'use strict'

const ProcessInput = (rawData) => {
  const linesData = rawData.trim().split('\n')

  const [numItems, numCategories, minThreshold] = linesData[0].split(' ').map(Number)
  const itemCollection = []

  for (let idx = 1; idx <= numItems; idx++) {
    const [costValue, ...capabilityLevels] = linesData[idx].split(' ').map(Number)
    itemCollection.push({
      cost: costValue,
      abilities: capabilityLevels
    })
  }

  const totalCosts = []

  for (let combinationIndex = 0; combinationIndex < (1 << numItems); combinationIndex++) {
    let currentCombination = []
    const accumulatedStats = { totalCost: 0, currentAbilities: new Array(numCategories).fill(0) }

    for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
      if (combinationIndex & (1 << itemIndex)) {
        for (let categoryIndex = 0; categoryIndex < numCategories; categoryIndex++) {
          accumulatedStats.currentAbilities[categoryIndex] += itemCollection[itemIndex].abilities[categoryIndex]
        }
        accumulatedStats.totalCost += itemCollection[itemIndex].cost
      }
    }
    if (accumulatedStats.currentAbilities.every(level => level >= minThreshold)) {
      totalCosts.push(accumulatedStats.totalCost)
    }
  }

  let finalOutcome = totalCosts.length ? totalCosts.sort()[0] : -1
  console.log(finalOutcome)
  return finalOutcome
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'))