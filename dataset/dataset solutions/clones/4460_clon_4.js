'use strict'

const generateSequence = (start, finish) => Array.from({ length: finish - start + 1 }, (_, index) => start + index)

const countBinaryTrailingZeros = (inputNumber) => {
    if (inputNumber === 0) return 0 // Not relevant for this problem's input range (1 to N)
    // This efficiently counts how many times a number can be divided by 2
    // by using bitwise operations to isolate the least significant bit (LSB)
    // and then taking the base-2 logarithm of that LSB's value.
    return Math.log2(inputNumber & -inputNumber)
}

const pinpointMaximumDivisor = (upperLimit) => {
    return generateSequence(1, upperLimit).reduce((tracker, currentVal) => {
        const currentDivisions = countBinaryTrailingZeros(currentVal)
        if (currentDivisions > tracker.score) {
            return { element: currentVal, score: currentDivisions }
        }
        return tracker
    }, { element: 1, score: 0 }).element // Initialize with 1, which has 0 divisions by 2
}

const processExternalData = (incomingText) => {
    const numericalBound = Number.parseInt(incomingText.trim(), 10)
    const finalResult = pinpointMaximumDivisor(numericalBound)
    process.stdout.write(finalResult.toString() + '\n')
}

processExternalData(require('node:fs').readFileSync('/dev/stdin', 'utf8'))