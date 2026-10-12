'use strict'
const lines = require('fs').readFileSync(0, 'utf8').split('\n')
const inputString = lines[0]

let totalAccumulatedSum = 0

const computeAllSums = (currentPosition, termComponents) => {
  if (currentPosition === inputString.length) {
    totalAccumulatedSum += termComponents.reduce((acc, val) => acc + val, 0)
    return
  }

  for (let nextSegmentEnd = currentPosition; nextSegmentEnd < inputString.length; nextSegmentEnd++) {
    const segmentValue = parseInt(inputString.substring(currentPosition, nextSegmentEnd + 1), 10)
    
    termComponents.push(segmentValue)
    computeAllSums(nextSegmentEnd + 1, termComponents)
    termComponents.pop()
  }
}

computeAllSums(0, [])
console.log(totalAccumulatedSum)
