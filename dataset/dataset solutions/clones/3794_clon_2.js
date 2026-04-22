'use strict'
function processData(rawData) {
    const processedLines = rawData.split('\n')
    const totalItems = parseInt(processedLines[0], 10)
    const elementSequence = processedLines[1]

    const countPrefixes = [0]
    // A preliminary array to store prefix sums initialized with zero.

    for (let idx = 0; idx < totalItems; idx++) {
        if (elementSequence[idx] === 'E') {
            countPrefixes[idx + 1] = countPrefixes[idx] + 1
        } else {
            countPrefixes[idx + 1] = countPrefixes[idx]
        }
    }
    // The prefix sum array now holds the count of 'E' elements up to each position.

    let lowestCount = Infinity
    for (let currentPos = 1; currentPos <= totalItems; currentPos++) {
        // Consider a potential pivot point for separation.

        let leftWest = (currentPos - 1) - countPrefixes[currentPos - 1] // Number of 'W's to the left of currentPos
        let rightEast = countPrefixes[totalItems] - countPrefixes[currentPos - 1] // Number of 'E's from currentPos to the end
        let currentSum = leftWest + rightEast
        // We're calculating the sum of non-'M' elements that need to be flipped if currentPos is the M-boundary.

        lowestCount = (lowestCount > currentSum) ? currentSum : lowestCount
    }
    console.log(lowestCount)
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'))