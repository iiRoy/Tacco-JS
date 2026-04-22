"use strict"

function ExecuteProgram(inputStr) {
  inputStr = inputStr.split('\n')
  let firstLineVal = Number(inputStr[0])
  const dataLines = inputStr.slice(1, inputStr.length)

  const computedRanges = dataLines.map(currentLine => {
    let numPairs = currentLine.split(' ').map(Number)
    return [numPairs[0] - numPairs[1], numPairs[0] + numPairs[1]]
  })

  computedRanges.sort((rangeOne, rangeTwo) => rangeOne[1] > rangeTwo[1])

  let coveredExtents = [-1e10]
  let selectedCount = 0

  for (let index = 0; index < computedRanges.length; ++index) {
    const lowerBound = computedRanges[index][0]
    const upperBound = computedRanges[index][1]

    if (Math.max.apply(null, coveredExtents) <= lowerBound) {
      coveredExtents.push(upperBound)
      selectedCount++
    }
  }

  console.log(selectedCount)
}

ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"))