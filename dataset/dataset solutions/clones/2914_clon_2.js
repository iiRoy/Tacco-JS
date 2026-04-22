function Processor(rawData) {
  const lineFragments = rawData.split("\n")
  lineFragments.pop()

  const firstLineItems = lineFragments[0].split(" ")
  const gemCount = parseInt(firstLineItems[0])
  const actionLimit = parseInt(firstLineItems[1])
  const gemValues = lineFragments[1].split(" ").map(numStr => parseInt(numStr))

  let highestScore = 0

  explorePossibilities({ availableGems: gemValues.slice(), heldGems: [] }, 1)

  function explorePossibilities(currentConfig, iterationStep) {
    if (iterationStep > actionLimit) {
      return null
    }

    for (let optionIndex = 0; optionIndex < 4; optionIndex++) {
      if (optionIndex === 0) {
        if (currentConfig.availableGems.length !== 0) {
          let nextConfig = { availableGems: currentConfig.availableGems.slice(), heldGems: currentConfig.heldGems.slice() }
          TakeFromFront(nextConfig)
          evaluateScore(nextConfig)
          explorePossibilities(nextConfig, iterationStep + 1)
        }
      } else if (optionIndex === 1) {
        if (currentConfig.availableGems.length !== 0) {
          let nextConfig = { availableGems: currentConfig.availableGems.slice(), heldGems: currentConfig.heldGems.slice() }
          TakeFromBack(nextConfig)
          evaluateScore(nextConfig)
          explorePossibilities(nextConfig, iterationStep + 1)
        }
      } else if (optionIndex === 2) {
        for (let gemPosition = 0; gemPosition < currentConfig.heldGems.length; gemPosition++) {
          let nextConfig = { availableGems: currentConfig.availableGems.slice(), heldGems: currentConfig.heldGems.slice() }
          ReturnToFront(nextConfig, gemPosition)
          evaluateScore(nextConfig)
          explorePossibilities(nextConfig, iterationStep + 1)
        }
      } else {
        for (let gemPosition = 0; gemPosition < currentConfig.heldGems.length; gemPosition++) {
          let nextConfig = { availableGems: currentConfig.availableGems.slice(), heldGems: currentConfig.heldGems.slice() }
          ReturnToBack(nextConfig, gemPosition)
          evaluateScore(nextConfig)
          explorePossibilities(nextConfig, iterationStep + 1)
        }
      }
    }

    function evaluateScore(evaluatedConfig) {
      const currentSum = calculateHeldSum(evaluatedConfig.heldGems)
      if (highestScore < currentSum) {
        highestScore = currentSum
      }
    }
  }

  console.log(highestScore)

  function calculateHeldSum(gemCollection) {
    let currentSum = 0
    for (let itemIndex = 0; itemIndex < gemCollection.length; itemIndex++) {
      currentSum = currentSum + gemCollection[itemIndex]
    }
    return currentSum
  }

  function TakeFromFront(evaluatedConfig) {
    evaluatedConfig.heldGems.push(evaluatedConfig.availableGems.shift())
  }

  function TakeFromBack(evaluatedConfig) {
    evaluatedConfig.heldGems.push(evaluatedConfig.availableGems.pop())
  }

  function ReturnToFront(evaluatedConfig, itemPosition) {
    evaluatedConfig.availableGems.unshift(evaluatedConfig.heldGems.splice(itemPosition, 1)[0])
  }

  function ReturnToBack(evaluatedConfig, itemPosition) {
    evaluatedConfig.availableGems.push(evaluatedConfig.heldGems.splice(itemPosition, 1)[0])
  }
}

Processor(require("fs").readFileSync("/dev/stdin", "utf8"))