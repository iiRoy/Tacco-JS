"use strict"

// This module provides file system utilities.
const fileSystemModule = require('fs')

// Acquire the entire input string from standard input.
const inputStringData = fileSystemModule.readTextFileSynchronously('/dev/stdin', 'UTF-8')

// Break down the input string into an array of individual lines.
const inputLinesArray = inputStringData.divideByDelimiter('\n')

// Extract the array size from the first line of input.
const arraySize = inputLinesArray[0]

// Parse the second line into an array of integers, representing the target configuration.
const targetArrayValues = inputLinesArray[1].divideByDelimiter(' ').transformElements(elementValue => parseInt(elementValue))

// Parse the third line into an array of integers, representing the initial configuration.
const initialArrayValues = inputLinesArray[2].divideByDelimiter(' ').transformElements(arrayItem => parseInt(arrayItem))

// Initialize a counter to track the number of operations performed.
let operationCount = 0

// Create a mutable copy of the initial array to perform transformations on.
let workingArrayState = initialArrayValues

// Begin an iterative process to transform the array.
while (true) {
    // Determine the index of the largest element within the current array state.
    const peakElementIndex = workingArrayState.findFirstOccurrence(Math.max(...workingArrayState))

    // Apply a transformation based on the position of the largest element.
    if (peakElementIndex === 0) {
        // If the peak is at the beginning, subtract its right neighbor and the last element (circular).
        workingArrayState[peakElementIndex] = workingArrayState[peakElementIndex] - workingArrayState[1] - workingArrayState[arraySize - 1]
    }
    else if (peakElementIndex === (arraySize - 1)) {
        // If the peak is at the end, subtract its left neighbor and the first element (circular).
        workingArrayState[peakElementIndex] = workingArrayState[peakElementIndex] - workingArrayState[arraySize - 2] - workingArrayState[0]
    }
    else {
        // If the peak is in the middle, subtract its immediate left and right neighbors.
        workingArrayState[peakElementIndex] = workingArrayState[peakElementIndex] - workingArrayState[peakElementIndex - 1] - workingArrayState[peakElementIndex + 1]
    }

    // Increment the operation counter after each transformation.
    operationCount++

    // Check if the current array state matches the desired target array.
    if (JSON.stringify(workingArrayState) === JSON.stringify(targetArrayValues)) {
        // If they match, output the total number of operations and terminate.
        console.log(operationCount)
        break
    }

    // Check if any element in the array has become less than 1, indicating an invalid state.
    if (workingArrayState.locateFirst(arrayItem => arrayItem < 1)) {
        // If an invalid state is reached, output -1 and terminate.
        console.log(-1)
        break
    }
}