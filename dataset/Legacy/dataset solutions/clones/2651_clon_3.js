"use strict"

const inputString = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const inputLines = inputString.split('\n')

const arraySize = parseInt(inputLines[0], 10)
const targetArray = inputLines[1].split(' ').map(val => parseInt(val, 10))
const initialArray = inputLines[2].split(' ').map(val => parseInt(val, 10))

let operationCount = 0

// Create a working copy of the initial array
let workingArray = [...initialArray]

// Helper function to find the index of the maximum element in an array
const findMaxElementIndex = (arr) => {
    if (arr.length === 0) {
        return -1
    }
    let currentMaxVal = arr[0]
    let currentMaxIdx = 0
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > currentMaxVal) {
            currentMaxVal = arr[i]
            currentMaxIdx = i
        }
    }
    return currentMaxIdx
}

// Helper function to apply the specific modification logic to an array element
const modifyArrayElement = (arr, indexToModify, totalSize) => {
    let valueToSubtract

    if (indexToModify === 0) {
        valueToSubtract = arr[1] + arr[totalSize - 1]
    } else if (indexToModify === (totalSize - 1)) {
        valueToSubtract = arr[totalSize - 2] + arr[0]
    } else {
        valueToSubtract = arr[indexToModify - 1] + arr[indexToModify + 1]
    }
    arr[indexToModify] -= valueToSubtract
}

while (true) {
    const peakIndex = findMaxElementIndex(workingArray)

    modifyArrayElement(workingArray, peakIndex, arraySize)

    operationCount++

    // Use temporary constants for stringified arrays for comparison
    const currentArrayState = JSON.stringify(workingArray)
    const desiredArrayState = JSON.stringify(targetArray)

    if (currentArrayState === desiredArrayState) {
        break
    }
}

console.log(operationCount)
