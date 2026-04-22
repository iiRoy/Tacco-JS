'use strict'

const processor = (rawInput) => {
    const numericChars = rawInput.trim().split('')
    let totalSummation = 0

    const generateCombinations = (indexPosition, currentPartitions) => {
        if (indexPosition === numericChars.length) {
            totalSummation += currentPartitions.reduce((currentAccumulation, element) => currentAccumulation + element, 0)
            return
        }

        // Option A: Append the current digit to the last number in the currentPartitions
        if (currentPartitions.length > 0) {
            const lastSegment = currentPartitions[currentPartitions.length - 1]
            const nextDigit = parseInt(numericChars[indexPosition], 10)
            const extendedSegment = lastSegment * 10 + nextDigit
            const updatedPartitions = [...currentPartitions.slice(0, -1), extendedSegment]
            generateCombinations(indexPosition + 1, updatedPartitions)
        }

        // Option B: Start a new number with the current digit
        const newSegment = parseInt(numericChars[indexPosition], 10)
        generateCombinations(indexPosition + 1, [...currentPartitions, newSegment])
    }

    // Initial call: Begin the process by considering the first digit as the first number
    // and then recursively building combinations from the second digit onwards.
    generateCombinations(1, [parseInt(numericChars[0], 10)])

    console.log(totalSummation)
}

processor(require('fs').readFileSync('/dev/stdin', 'utf8'))