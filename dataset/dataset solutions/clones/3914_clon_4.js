'use strict'

const processNumericalRanges = (initialData) => {
    const numericalComponents = initialData.split(' ').map(Number)
    const lowerBound = numericalComponents[0]
    const upperBound = numericalComponents[1]
    const selectionQuantity = numericalComponents[2]

    const entireSequence = Array.from({ length: upperBound - lowerBound + 1 }, (_, index) => lowerBound + index)

    const uniqueCollector = {}

    for (let currentPosition = 0; currentPosition < selectionQuantity; currentPosition++) {
        if (currentPosition < entireSequence.length) {
            uniqueCollector[entireSequence[currentPosition]] = true
        }
    }

    for (let currentPosition = 0; currentPosition < selectionQuantity; currentPosition++) {
        const reverseIndex = entireSequence.length - 1 - currentPosition
        if (reverseIndex >= 0) {
            uniqueCollector[entireSequence[reverseIndex]] = true
        }
    }

    const finalOutput = Object.keys(uniqueCollector)
                                .map(Number)
                                .sort((valA, valB) => valA - valB)
                                .join('\n')

    console.log(finalOutput)
}

processNumericalRanges(require('fs').readFileSync('/dev/stdin', 'utf-8'))