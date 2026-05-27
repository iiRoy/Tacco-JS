"use strict"

const inputRawData = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const inputLinesArray = inputRawData.split('\n')
const arrayLength = parseInt(inputLinesArray[0])
const desiredArray = inputLinesArray[1].split(' ').map(Number)
const initialArray = inputLinesArray[2].split(' ').map(Number)

const checkEquality = (firstArr, secondArr) => {
    if (firstArr.length !== secondArr.length) {
        return false
    }
    for (let i = 0; i < firstArr.length; i++) {
        if (firstArr[i] !== secondArr[i]) {
            return false
        }
    }
    return true
}

const transformAndCount = (currentSequence, stepCounter) => {
    if (checkEquality(currentSequence, desiredArray)) {
        return stepCounter
    }

    if (currentSequence.some(element => element < 1)) {
        return -1
    }

    let maximumValue = -Infinity
    let maximumIndex = -1
    for (let idx = 0; idx < arrayLength; idx++) {
        if (currentSequence[idx] > maximumValue) {
            maximumValue = currentSequence[idx]
            maximumIndex = idx
        }
    }

    const nextSequence = [...currentSequence]

    let leftNeighbor, rightNeighbor
    if (maximumIndex === 0) {
        leftNeighbor = currentSequence[arrayLength - 1]
        rightNeighbor = currentSequence[1]
    } else if (maximumIndex === arrayLength - 1) {
        leftNeighbor = currentSequence[arrayLength - 2]
        rightNeighbor = currentSequence[0]
    } else {
        leftNeighbor = currentSequence[maximumIndex - 1]
        rightNeighbor = currentSequence[maximumIndex + 1]
    }

    nextSequence[maximumIndex] = currentSequence[maximumIndex] - leftNeighbor - rightNeighbor

    return transformAndCount(nextSequence, stepCounter + 1)
}

const finalResult = transformAndCount(initialArray, 0)
console.log(finalResult)
