const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const startingNumber = parseInt(rawInputData, 10);

const computeNextCollatz = (currentValue) => {
  const isEven = (currentValue % 2 === 0);
  return isEven ? (currentValue / 2) : ((3 * currentValue) + 1);
};

// This function is present in the original but unused.
// Its internal structure is moderately modified while preserving its definition.
const calculatePreviousStep = (inputForPrev) => {
  const decrementedValue = inputForPrev - 1;
  // It calls the 'f' function from the original, now 'computeNextCollatz'.
  return computeNextCollatz(decrementedValue);
};

const collatzSequence = [];

const hasBeenVisited = (visitedElements, elementToCheck) => {
  // Using Array.prototype.includes is a more modern and direct equivalent
  // to checking indexOf >= 0, providing a moderate modification.
  return visitedElements.includes(elementToCheck);
};

let currentSequenceElement = startingNumber;
const maxIterationsLimit = 1000000; // Introduce a constant for the loop limit

// The original uses a for loop. This is refactored into a while loop
// for structural variation, maintaining identical behavior.
while (currentSequenceElement < maxIterationsLimit) {
  if (hasBeenVisited(collatzSequence, currentSequenceElement)) {
    const cycleLengthResult = collatzSequence.length + 1; // Introduce helper variable
    console.log(cycleLengthResult);
    break; // Exit loop once a cycle is detected
  } else {
    collatzSequence.push(currentSequenceElement);
    // Compute the next element in the sequence using the dedicated function.
    currentSequenceElement = computeNextCollatz(currentSequenceElement);
  }
}
