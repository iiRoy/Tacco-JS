const processInput = (rawData) => {
  // This section parses the raw input string into a structured array of numerical values.
  // It first splits the input by newline characters, then each resulting line by spaces,
  // and finally converts every segment into a floating-point number.
  let processedData = rawData
    .split('\n') // Divide the entire input string into an array of individual lines.
    .map((lineSegment) => lineSegment.split(' ')) // For each line, break it into an array of string components.
    .map((stringComponents) => stringComponents.map(parseFloat)); // Convert each string component to a floating-point number.

  // The initial line of the input data is stored, although its direct application in the subsequent calculation is not present.
  const firstLineInformation = processedData[0];
  // The second line of the input, which is an array of numbers, serves as the primary dataset for the computation.
  let numericalSequence = processedData[1];

  // The numerical sequence is modified by adding its first element to the beginning
  // and its last element to the end. This creates a 'padded' or 'wrapped' array.
  numericalSequence = [numericalSequence[0]].concat(numericalSequence).concat(numericalSequence.slice(-1));

  // A variable is initialized to accumulate the final computed sum.
  let finalAccumulatedSum = 0;

  // The 'reduce' method is employed to iterate through the modified numerical sequence.
  // The 'priorElement' acts as the accumulator, starting with the first element of 'numericalSequence'.
  // In each step, the minimum value between the 'priorElement' and the 'currentElement' is added to 'finalAccumulatedSum'.
  // The 'currentElement' then becomes the 'priorElement' for the subsequent iteration.
  numericalSequence.reduce((priorElement, currentElement) => {
    finalAccumulatedSum += Math.min(priorElement, currentElement); // Add the smaller value of the two adjacent numbers to the running total.
    return currentElement; // The current element becomes the prior element for the next step in the reduction.
  });

  // The computed final sum is written to the standard output stream.
  process.stdout.write(finalAccumulatedSum);
};

// The program reads the entire content of '/dev/stdin' as a UTF-8 encoded string
// and then passes this raw data to the 'processInput' function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
