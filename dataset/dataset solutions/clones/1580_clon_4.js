"use strict";

const processInputData = (incomingText) => {
  const numericValues = incomingText.match(/-?\d+/g).map(Number);
  const initialCount = numericValues[0]; // The first number represents N, the count of elements
  const dataSequence = numericValues.slice(1);

  if (dataSequence.length === 0) {
    console.log(0);
    return;
  }

  // Use a functional reduce approach to iterate and accumulate the required adjustments.
  // The accumulator keeps track of the total increment and the highest value encountered so far
  // that the subsequent elements must meet or exceed.
  const initialAccumulator = {
    totalIncrement: 0,
    currentPeak: dataSequence[0], // The first element establishes the initial "peak"
  };

  const finalResult = dataSequence.slice(1).reduce(
    (acc, currentElement) => {
      let elementAfterModification = currentElement;
      let increaseRequired = 0;

      // If the current element is less than the current peak, it needs to be increased.
      if (currentElement < acc.currentPeak) {
        increaseRequired = acc.currentPeak - currentElement;
        elementAfterModification = acc.currentPeak; // The element is conceptually raised to the peak value
      }

      return {
        totalIncrement: acc.totalIncrement + increaseRequired,
        currentPeak: elementAfterModification, // This becomes the new peak for future comparisons
      };
    },
    initialAccumulator
  );

  console.log(finalResult.totalIncrement);
};

// Entry point for the operation, distinct from the original's 'main'
const initiateOperation = (payload) => {
    processInputData(payload);
};

initiateOperation(require("fs").readFileSync("/dev/stdin", "utf-8"));