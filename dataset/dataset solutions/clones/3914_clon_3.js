'use strict'

const processInput = (rawDataString) => {
    const numericStrings = rawDataString.split(' ')
    const parsedValues = numericStrings.map(str => parseInt(str, 10))

    const startVal = parsedValues[0]
    const endVal = parsedValues[1]
    const countLimit = parsedValues[2]

    const rangeLength = endVal - startVal + 1
    const fullRange = Array.from({ length: rangeLength }, (_, idx) => startVal + idx)

    const initialElements = fullRange.slice(0, countLimit)
    const finalElements = fullRange.slice(Math.max(0, fullRange.length - countLimit))
    
    const combinedElements = [...initialElements, ...finalElements]
    const uniqueNumbers = new Set(combinedElements)
    
    uniqueNumbers.forEach(numToPrint => console.log(numToPrint))
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'))
