"use strict";
const xpl_source = require("fs").readFileSync("/dev/stdin", "utf8");
let xpl_index = 0;
const xpl_data = xpl_source.split(/ |\n/).filter(Boolean); // Filter empty strings

const reader = {
  pullNumber: () => Number(xpl_data[xpl_index++]),
  pullString: () => xpl_data[xpl_index++],
  pullLargeInt: () => BigInt(xpl_data[xpl_index++]),
  pullSeries: (count, isString) => {
    const segment = xpl_data.slice(xpl_index, xpl_index + count);
    xpl_index += count;
    return isString ? segment : segment.map(Number);
  },
  pullMatrix: (rows, cols, isString) => {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
      const row = xpl_data.slice(xpl_index, xpl_index + cols);
      xpl_index += cols;
      matrix.push(isString ? row : row.map(Number));
    }
    return matrix;
  }
};

// Generic multi-dimensional array creation
// Equivalent to original xArray, but implemented without eval
const createMultiArray = (initialValue, ...dimensions) => {
    const build = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        const arr = new Array(currentDimSize);
        for (let i = 0; i < currentDimSize; i++) {
            arr[i] = build(remainingDims);
        }
        return arr;
    };
    return build(dimensions);
};


let totalValueAccumulator = 0;
let outputLines = [];

const processSchedule = () => {
  const rotationDuration = reader.pullNumber(); // 'd' in original
  const elementCount = 26; // 'n' in original
  const upkeepCosts = reader.pullSeries(elementCount); // 'c' in original

  // 'a' in original. Represents accumulated negative impact for not selecting an element.
  // Using a Map for sparse-like behavior or just to be different from array.
  // Keys are 0-indexed element IDs, values are their current penalty.
  let elementDissatisfaction = new Map();
  for (let k = 0; k < elementCount; k++) {
    elementDissatisfaction.set(k, 0);
  }

  for (let day = 0; day < rotationDuration; day++) {
    const dailySatisfaction = reader.pullSeries(elementCount); // 's' in original

    let bestDailyOption = -Infinity;
    let chosenElementId = -1;

    // First, apply daily penalties for all elements
    // Collect potential scores for current day
    const potentialScores = new Array(elementCount);
    for (let elem = 0; elem < elementCount; elem++) {
      const currentPenalty = elementDissatisfaction.get(elem);
      const newPenalty = currentPenalty - upkeepCosts[elem]; // Apply daily cost
      elementDissatisfaction.set(elem, newPenalty); // Update for next day's base
      
      // Calculate utility for selecting this element *today*
      // Based on original: s[j] - a[j] + c[j]
      // Where a[j] is the *new* a[j] (after c[j] subtraction)
      // So, s[j] - (previous_a[j] - c[j]) + c[j] = s[j] - previous_a[j] + 2 * c[j]
      // Let's stick to the exact formula as interpreted from original code's variable states.
      // u = s[j] - a[j] + c[j]
      // where a[j] is the value *after* a[j] -= c[j]
      const utility = dailySatisfaction[elem] - newPenalty + upkeepCosts[elem];
      potentialScores[elem] = utility;

      if (utility > bestDailyOption) {
        bestDailyOption = utility;
        chosenElementId = elem;
      }
    }

    outputLines.push(chosenElementId + 1); // 1-indexed output

    // Update global score and reset chosen element's dissatisfaction
    totalValueAccumulator += dailySatisfaction[chosenElementId];
    elementDissatisfaction.set(chosenElementId, 0); // Reset penalty for chosen element

    // Add accumulated dissatisfaction from all elements to the total value
    for (let elem = 0; elem < elementCount; elem++) {
      totalValueAccumulator += elementDissatisfaction.get(elem);
    }
  }

  return outputLines.join("\n");
};

// Main execution flow
const finalResult = processSchedule();
if (finalResult !== undefined) {
  console.log(String(finalResult));
}