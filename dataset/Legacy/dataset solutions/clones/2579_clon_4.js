function processInput(inputString) {
  const lineSegments = inputString.split("\n");

  const firstLineValue = parseInt(lineSegments.shift()); // 'n' is not used in the core logic
  const numericSequenceB = lineSegments.shift().split(" ").map(val => parseInt(val));

  // Core logic: Generate the sequence 'a' based on 'b'
  // The original logic builds 'an' with length bn.length + 1
  // an[0] = bn[0]
  // For k from 1 to bn.length - 1: an[k] = min(bn[k-1], bn[k])
  // an[bn.length] = bn[bn.length - 1]

  // This implementation uses a functional approach with Array.prototype.reduce
  // to construct the 'a' sequence, avoiding the imperative pop/push operations
  // and explicit loop structure of the original.
  const aSequence = numericSequenceB.reduce((accumulator, currentBElement, currentIndex) => {
    // The accumulator holds an object:
    // {
    //   generatedElements: Array<number>, // The 'an' array being built
    //   lastProcessedB: number           // The b[k-1] value for the next min calculation
    // }

    if (currentIndex === 0) {
      // For the first element of numericSequenceB (b[0]):
      // Initialize the generatedElements with b[0]
      // The lastProcessedB is also b[0] for the next step
      accumulator.generatedElements.push(currentBElement);
      accumulator.lastProcessedB = currentBElement;
    } else {
      // For subsequent elements of numericSequenceB (b[k] where k > 0):
      // Add min(b[k-1], b[k]) to generatedElements
      accumulator.generatedElements.push(Math.min(accumulator.lastProcessedB, currentBElement));
      // Update lastProcessedB to the current b[k] for the next iteration
      accumulator.lastProcessedB = currentBElement;
    }
    return accumulator;
  }, { generatedElements: [], lastProcessedB: 0 }); // Initial accumulator state

  // After the reduce loop, the last element of 'a' is the last element of 'b'
  aSequence.generatedElements.push(aSequence.lastProcessedB);

  // Calculate the sum of the generated 'a' sequence
  const totalSum = aSequence.generatedElements.reduce((currentTotal, element) => currentTotal + element, 0);

  console.log(totalSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
