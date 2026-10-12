'use strict'

const processInput = rawData => {
    const parsedLines = rawData.split('\n').map(lineSegment => lineSegment.split(' '))
    
    const firstLineSegments = parsedLines[0]

    const RADIX_DECIMAL = 10
    const valA = parseInt(firstLineSegments[0], RADIX_DECIMAL)
    const valB = parseInt(firstLineSegments[1], RADIX_DECIMAL)
    const valC = parseInt(firstLineSegments[2], RADIX_DECIMAL)

    const lowerBound = Math.min(valA, valB)
    const upperBound = Math.max(valA, valB)

    const isCStrictlyBetween = (valC > lowerBound && valC < upperBound)

    if (isCStrictlyBetween) {
        console.log('Yes')
    } else {
        console.log('No')
    }
}

const getFileContent = filePath => {
    return require('fs').readFileSync(filePath, 'utf8')
}

processInput(getFileContent('/dev/stdin'))
