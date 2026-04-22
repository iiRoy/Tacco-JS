"use strict";
const inputArguments = process.argv.slice(2);
let argumentIndex = 0;

function retrieveNumericValue() {
    if (argumentIndex >= inputArguments.length) {
        throw new Error("Input data exhausted.");
    }
    const val = Number(inputArguments[argumentIndex]);
    argumentIndex++;
    return val;
}

function obtainTextSegment() {
    if (argumentIndex >= inputArguments.length) {
        throw new Error("Input data exhausted.");
    }
    const val = inputArguments[argumentIndex];
    argumentIndex++;
    return val;
}

function obtainLargeInteger() {
    if (argumentIndex >= inputArguments.length) {
        throw new Error("Input data exhausted.");
    }
    const val = BigInt(inputArguments[argumentIndex]);
    argumentIndex++;
    return val;
}

function gatherElements(itemCount, keepAsText) {
    const resultList = [];
    for (let i = 0; i < itemCount; i++) {
        if (argumentIndex >= inputArguments.length) {
            throw new Error("Input data exhausted during gatherElements.");
        }
        const item = inputArguments[argumentIndex++];
        if (keepAsText) {
            resultList.push(item);
        } else {
            resultList.push(Number(item));
        }
    }
    return resultList;
}

function acquireSortedNumericalCollection(countItems, sortDescending) {
    const numList = [];
    for (let i = 0; i < countItems; i++) {
        if (argumentIndex >= inputArguments.length) {
            throw new Error("Input data exhausted during acquireSortedNumericalCollection.");
        }
        numList.push(Number(inputArguments[argumentIndex++]));
    }

    for (let i = 0; i < numList.length - 1; i++) {
        let extremumIndex = i;
        for (let j = i + 1; j < numList.length; j++) {
            if (sortDescending) {
                if (numList[j] > numList[extremumIndex]) {
                    extremumIndex = j;
                }
            } else {
                if (numList[j] < numList[extremumIndex]) {
                    extremumIndex = j;
                }
            }
        }
        if (extremumIndex !== i) {
            [numList[i], numList[extremumIndex]] = [numList[extremumIndex], numList[i]];
        }
    }
    return numList;
}

function createMatrix(height, width, keepTextual) {
    const grid = [];
    for (let row = 0; row < height; row++) {
        const currentRow = [];
        for (let col = 0; col < width; col++) {
            if (argumentIndex >= inputArguments.length) {
                throw new Error("Input data exhausted during createMatrix.");
            }
            const cellValue = inputArguments[argumentIndex++];
            if (keepTextual) {
                currentRow.push(cellValue);
            } else {
                currentRow.push(Number(cellValue));
            }
        }
        grid.push(currentRow);
    }
    return grid;
}

function generateMultiDimensionalStructure(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    function createDimension(dimIndex) {
        if (dimIndex === dimensions.length - 1) {
            return new Array(dimensions[dimIndex]).fill(initialValue);
        } else {
            return new Array(dimensions[dimIndex]).fill(null).map(() => createDimension(dimIndex + 1));
        }
    }
    
    return createDimension(0);
}

const outputBuffer = [];
function recordOutput(content) {
    outputBuffer.push(String(content));
}

function processComputationalCore(){
  const quantity = retrieveNumericValue();
  let repeatedSegment = "";
  if (quantity > 0) {
      repeatedSegment = Array(quantity).fill("ACL").join("");
  }
  return repeatedSegment;
}

let finalResult = processComputationalCore();
if(finalResult !== undefined) {
    recordOutput(finalResult);
}
if(outputBuffer.length > 0) {
    console.log(outputBuffer.join("\n"));
}