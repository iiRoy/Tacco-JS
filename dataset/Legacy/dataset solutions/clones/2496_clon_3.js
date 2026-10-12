'use strict'

const DECIMAL_RADIX = 10

const processInput = rawData => {
    const inputLines = rawData.split('\n')
    const lineOneParts = inputLines[0].split(' ')
    const lineTwoParts = inputLines[1].split(' ')

    const lengthLimit = parseInt(lineOneParts[0], DECIMAL_RADIX)
    const inputString = lineTwoParts[0]

    let blockCount = 0
    let previousChar

    if (lengthLimit > 0) {
        blockCount = 1
        previousChar = inputString[0]

        for (let charIndex = 1; charIndex < lengthLimit; charIndex++) {
            const currentChar = inputString[charIndex]
            if (previousChar !== currentChar) {
                blockCount++
            }
            previousChar = currentChar
        }
    }

    console.log(blockCount)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
