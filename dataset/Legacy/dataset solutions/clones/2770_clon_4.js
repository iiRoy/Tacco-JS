"use strict";

const processInput = (rawData) => {
  const inputLines = rawData.trim().split("\n");
  const elementCount = parseInt(inputLines[0]);
  const doubledValues = inputLines[1].split(" ").map((strVal) => parseInt(2 * strVal));

  // Calculate the alternating sum of the doubledValues array.
  // The original code calculates: A[N-1] - A[N-2] + A[N-3] - ... + (-1)^(N-1) * A[0]
  // This is achieved by reversing the array and then applying a reducer for an alternating sum.
  const alternatingSumResult = doubledValues.slice().reverse().reduce((accumulator, currentItem, idx) => {
    return idx % 2 === 0 ? accumulator + currentItem : accumulator - currentItem;
  }, 0);

  // The initial term for the sequence is half of the alternating sum.
  const initialTerm = alternatingSumResult / 2;

  // Generate the final sequence of numbers.
  // The original code calculates:
  // result[0] = initialTerm
  // result[i] = doubledValues[i-1] - result[i-1] for i > 0
  // This is implemented using Array.from and map, maintaining state with a closure.
  let priorTerm = initialTerm;
  const finalSequence = Array.from({ length: elementCount }, (_, index) => {
    if (index === 0) {
      return priorTerm;
    }
    const currentCalculatedTerm = doubledValues[index - 1] - priorTerm;
    priorTerm = currentCalculatedTerm; // Update the state for the next iteration
    return currentCalculatedTerm;
  });

  console.log(finalSequence.join(" "));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
