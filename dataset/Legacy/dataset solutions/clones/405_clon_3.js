#!/usr/bin/node
(function() {
  // Array to store the numeric values parsed from stdin, acting as test case indices.
  const testCaseValues = [];

  // Set up stdin to read data.
  const inputReader = process.openStdin();
  inputReader.setEncoding('utf8');

  /**
   * Generates a sequence of numbers similar to Tribonacci,
   * where each element is the sum of the previous three.
   * The sequence is pre-calculated up to a certain length.
   * @returns {number[]} The generated sequence.
   */
  const generateNumericSequence = () => {
    // Initialize the sequence with the first three values.
    const sequenceElements = [1, 1, 2];
    const sequenceUpperLimit = 31; // Generate up to index 30 (31 elements total)

    // Populate the rest of the sequence.
    for (let currentIdx = 3; currentIdx < sequenceUpperLimit; currentIdx++) {
      const nextElement = sequenceElements[currentIdx - 1] +
                           sequenceElements[currentIdx - 2] +
                           sequenceElements[currentIdx - 3];
      sequenceElements.push(nextElement);
    }
    return sequenceElements;
  };

  // Pre-calculate the sequence once when the script starts.
  const precomputedSequence = generateNumericSequence();

  // A buffer to hold incomplete lines read from stdin.
  let bufferedInputChunk = "";

  /**
   * Performs the final calculation on a sequence element.
   * This function encapsulates the specific arithmetic operation.
   * @param {number} sequenceElementValue - The value from the precomputed sequence.
   * @returns {number} The calculated integer result.
   */
  const computeFinalResult = (sequenceElementValue) => {
    // The original `^0` is equivalent to `Math.floor()` for positive numbers.
    // Using `Math.floor` for explicit clarity.
    return Math.floor((sequenceElementValue + 3649) / 3650);
  };

  // Event handler for incoming data from stdin.
  inputReader.on('data', function(incomingData) {
    // Concatenate the buffered fragment with the new incoming data.
    const combinedInput = bufferedInputChunk + incomingData;
    // Split the combined input by newline characters.
    const splitLines = combinedInput.split("\n");

    // The last element might be an incomplete line, so save it for the next chunk.
    bufferedInputChunk = splitLines.pop();

    // Process each complete line.
    splitLines.forEach(lineContent => {
      // Skip empty lines, replicating original behavior.
      if (lineContent === '') {
        return;
      }
      // Convert the line content to a number and then floor it using bitwise OR with 0.
      // This replicates the original `ref[i]^0` behavior, including converting non-numeric strings to 0.
      const parsedNumericValue = Number(lineContent) ^ 0;
      testCaseValues.push(parsedNumericValue);
    });
  });

  // Event handler for when stdin ends.
  inputReader.on('end', function(_unusedEndEventParam) {
    // Iterate through the collected test case values.
    // The original loop `for(var i=0;T[i];i++)` stops when T[i] is falsy (e.g., 0, undefined).
    // We replicate this by checking if `testIndex` is truthy before processing.
    testCaseValues.forEach(testIndex => {
      if (testIndex) { // Only process if the index is a truthy value (non-zero, non-null, non-undefined)
        const sequenceValue = precomputedSequence[testIndex];
        const finalOutput = computeFinalResult(sequenceValue);
        console.log(finalOutput);
      }
    });
  });
})();
