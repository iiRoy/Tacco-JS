"use strict"

const inputString = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const inputLines = inputString.split('\n')

const arraySize = parseInt(inputLines[0])
const targetArray = inputLines[1].split(' ').map(val => parseInt(val))
const initialArray = inputLines[2].split(' ').map(val => parseInt(val))

let operationCount = 0

let workingArray = initialArray

function findPeakAndItsIndex(arr) {
    let maxVal = -Infinity
    let maxIdx = -1
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i]
            maxIdx = i
        }
    }
    return { value: maxVal, index: maxIdx }
}

function hasNegativeOrZeroElement(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < 1) {
            return true
        }
    }
    return false
}

while (true) {
    const peakInfo = findPeakAndItsIndex(workingArray)
    const peakIndex = peakInfo.index

    const firstIndex = 0
    const lastIndex = arraySize - 1

    let neighborOneValue
    let neighborTwoValue

    if (peakIndex === firstIndex) {
        neighborOneValue = workingArray[firstIndex + 1]
        neighborTwoValue = workingArray[lastIndex]
    } else if (peakIndex === lastIndex) {
        neighborOneValue = workingArray[lastIndex - 1]
        neighborTwoValue = workingArray[firstIndex]
    } else {
        neighborOneValue = workingArray[peakIndex - 1]
        neighborTwoValue = workingArray[peakIndex + 1]
    }
    
    const totalNeighborsSum = neighborOneValue + neighborTwoValue
    workingArray[peakIndex] = workingArray[peakIndex] - totalNeighborsSum
    
    operationCount++

    if (hasNegativeOrZeroElement(workingArray)) {
        console.log(-1)
        break
    }

    if (JSON.stringify(workingArray) === JSON.stringify(targetArray)) {
        console.log(operationCount)
        break
    }
}
