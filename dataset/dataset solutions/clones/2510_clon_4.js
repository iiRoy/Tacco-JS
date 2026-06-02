"use strict"

const inputData = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const lines = inputData.split('\n')

const sourceString = lines[0]
const repeatFactor = parseInt(lines[1])

let totalOperations = 0

const isHomogeneous = sourceString.split('').every(char => char === sourceString[0])

if (isHomogeneous) {
    const totalLength = sourceString.length * repeatFactor
    totalOperations = Math.floor(totalLength / 2)
} else {
    const characterBlocks = sourceString.match(/(.)\1*/g)
    const operationsPerSingleInstance = characterBlocks.reduce((acc, block) => {
        return acc + Math.floor(block.length / 2)
    }, 0)

    totalOperations = operationsPerSingleInstance * repeatFactor

    const firstChar = sourceString[0]
    const lastChar = sourceString[sourceString.length - 1]
    const endsMatch = (firstChar === lastChar)

    if (endsMatch) {
        totalOperations += (repeatFactor - 1)
    }
}

console.log(totalOperations)
