'use strict'

const processInput = ( rawData ) => {

  let lineData = rawData.split('\n')

  const totalElementsCount = parseInt(lineData[0].split(' ')[0])
  const subsetSize = parseInt(lineData[0].split(' ')[1])

  const numericValues = lineData[1].split(' ').map( valStr => parseInt(valStr) )

  let minimumDistance = 100000000000 // Initialize with a very large value

  // Determine the optimal path for the target points
  for (let startIndex = 0; startIndex <= numericValues.length - subsetSize; startIndex++) {

    let currentSubset = numericValues.slice(startIndex, subsetSize + startIndex)

    // Calculate distance when starting from the leftmost point
    let distanceFromLeft = Math.abs(currentSubset[0]) + Math.abs(currentSubset[0] - currentSubset[currentSubset.length - 1])
    
    if (minimumDistance > distanceFromLeft) {
      minimumDistance = distanceFromLeft
    }

    // Calculate distance when starting from the rightmost point
    let distanceFromRight = Math.abs(currentSubset[currentSubset.length - 1]) + Math.abs(currentSubset[currentSubset.length - 1] - currentSubset[0])
    
    if (minimumDistance > distanceFromRight) {
      minimumDistance = distanceFromRight
    }
  }

  console.log(minimumDistance)
}

processInput( require('fs').readFileSync('/dev/stdin', 'utf-8') )