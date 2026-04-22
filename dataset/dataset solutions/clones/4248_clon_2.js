"use strict";

// This module handles input reading and performs a specific array manipulation task.
const dataStream = require("node:fs").readFileSync("/dev/stdin", "utf8");
let inputChunks = dataStream.split(/ |\n/);
let chunkIndex = 0;

// Reads the next available chunk from the input as an integer.
const readInteger = () => Number(inputChunks[chunkIndex++]);

// Reads the next available chunk from the input as a string.
function readText() {
  return inputChunks[chunkIndex++];
}

// Reads the next available chunk from the input as a BigInt.
const readBigInt = ( ) => BigInt( inputChunks[ chunkIndex++ ] );

// Reads a sequence of 'count' items from the input.
// If 'asStrings' is true, returns them as strings; otherwise, converts them to numbers.
function readSequence(count, asStrings) {
  if (asStrings) {
    return inputChunks.slice(chunkIndex, chunkIndex += count);
  } else {
    return inputChunks.slice(chunkIndex, chunkIndex += count).map( (item) => Number(item) );
  }
}

// Reads a matrix of 'height' rows and 'width' columns from the input.
// If 'asStrings' is true, elements are strings; otherwise, they are numbers.
function readMatrix(height, width, asStrings) {
  let resultRows = [];
  let rowIdx = 0;
  if (asStrings) {
    for (; rowIdx < height; rowIdx++) {
      resultRows.push(inputChunks.slice(chunkIndex, chunkIndex += width));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultRows.push(inputChunks.slice(chunkIndex, chunkIndex += width).map((val) => Number(val)));
    }
  }
  return resultRows;
}

// Creates a multi-dimensional array dynamically based on provided dimensions and an initial value.
function createMultiDimArray(initialValue) {
  let dimensionArgs = arguments;
  let numDimensions = dimensionArgs.length;
  // Construct the array creation string from inner-most dimension outwards
  let arrayCreationExpression = "Array(dimensionArgs[" + --numDimensions + "]).fill().map( _ => { return " + initialValue + "; } )";
  while ( --numDimensions ) {
    arrayCreationExpression = "Array(dimensionArgs[" + numDimensions + "]).fill().map( _ => " + arrayCreationExpression + " )";
  }
  return eval(arrayCreationExpression); // Execute the dynamically constructed array creation code
}


// --- Main Program Execution ---
const finalResult = processData();

// Output the result if it's not undefined.
if ( finalResult !== undefined ) { console.log(String(finalResult)); }


// Main function to execute the problem logic.
function processData() {
  let totalElements = readInteger();
  // Initialize a list of numbers, padding with a zero at the start.
  let numberList = [0].concat(readSequence(totalElements));

  // Outer loop: iterates 'totalElements' times.
  for ( let outerCount = 0; outerCount < totalElements; outerCount++ )
    // Inner loop: iterates from 'totalElements' down to 1.
    // 'currentDivisor' acts as a divisor for subsequent elements.
    for ( let currentDivisor = totalElements; currentDivisor >= 1; currentDivisor-- ) {
      let currentSum = 0; // Accumulator for the sum of multiples.

      // Calculate the sum of elements at indices that are multiples of 'currentDivisor'.
      for ( let multipleIterator = currentDivisor; multipleIterator <= totalElements; multipleIterator += currentDivisor ) {
        currentSum += numberList[multipleIterator];
      }

      // If the calculated sum is negative, reset all corresponding multiples to zero.
      if ( currentSum < 0 ) {
        for ( let multipleIterator = currentDivisor; multipleIterator <= totalElements; multipleIterator += currentDivisor ) {
          numberList[multipleIterator] = 0;
        }
      }
    }
  // Return the sum of all elements in the modified list.
  return numberList.reduce((accumulator, currentValue) => accumulator + currentValue);
}