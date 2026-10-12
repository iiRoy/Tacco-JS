'use strict'

function InputReader(inputString) {
    let rawLines = inputString.split('\n');
    // Check if the last line is empty and remove it
    if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') {
        rawLines.pop();
    }
    this.lines = rawLines;
    this.currentLineIndex = 0;
}

InputReader.prototype.readIntsLine = function() {
    const lineContent = this.lines[this.currentLineIndex++];
    // Explicitly convert string parts to numbers using Number()
    return lineContent.split(' ').map(stringValue => Number(stringValue));
};

InputReader.prototype.readAllIntVectors = function() {
    const startingIndex = this.currentLineIndex;
    this.currentLineIndex = this.lines.length; // Mark all remaining lines as read
    // Convert all remaining lines to numbers
    return this.lines.slice(startingIndex).map(lineValue => Number(lineValue));
};

InputReader.prototype.readAllStringVectors = function() {
    const startingIndex = this.currentLineIndex;
    this.currentLineIndex = this.lines.length; // Mark all remaining lines as read
    return this.lines.slice(startingIndex);
};

InputReader.prototype.readNStringLines = function(count) {
    const startingIndex = this.currentLineIndex;
    this.currentLineIndex += count;
    return this.lines.slice(startingIndex, startingIndex + count);
};

const inputHandler = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

(() => {
    const totalElements = inputHandler.readIntsLine()[0];
    const dataArray = inputHandler.readIntsLine();

    // Type III: Rewriting summation using reduce method
    const initialSumValue = 0; // Helper constant for reduce
    const sumOfElements = dataArray.reduce((accumulator, currentValue) => accumulator + currentValue, initialSumValue);

    const averageValue = sumOfElements / totalElements;

    // Type III: Introduce a small local helper function for absolute difference
    const calculateAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

    let closestElement = dataArray[0];
    let closestIndex = 0;

    // Iterate through the array starting from the second element
    for (let currentIndex = 1; currentIndex < totalElements; currentIndex++) {
        const currentElementValue = dataArray[currentIndex]; // Helper variable for current element

        // Type III: Use helper function and temporary variables for comparison
        const currentDifference = calculateAbsoluteDifference(currentElementValue, averageValue);
        const closestDifference = calculateAbsoluteDifference(closestElement, averageValue);

        if (currentDifference < closestDifference) {
            closestElement = currentElementValue;
            closestIndex = currentIndex;
        }
    }

    console.log(closestIndex);
})();
