const processInput = (inputSegment => {
  // This function computes an adjusted value for each element.
  const calculateOffset = (currentVal, idx) => currentVal - idx - 1;

  // This function calculates the total absolute deviation from a base value.
  const computeTotalDeviation = (dataArray, offsetValues, baseValue) =>
    dataArray.reduce((accumulator, elementVal, elementIdx) =>
      accumulator + Math.abs(offsetValues[elementIdx] - baseValue), 0);

  // This function generates a new array of offset values.
  const generateOffsets = sourceArr =>
    sourceArr.map((item, itemIndex) => calculateOffset(item, itemIndex));

  // This function finds the median element in a sorted array.
  const findMiddleValue = numericList =>
    numericList[Math.floor(numericList.length / 2)];

  let processingBuffer = []; // Internal buffer to manage multi-line input.

  // The actual handler for incoming data chunks.
  return (inputData) => {
    if (!processingBuffer.length) {
      // First line of input: Expecting the count (N).
      processingBuffer.push(parseInt(inputData, 10)); // Store the integer N.
    } else if (processingBuffer.length === 1) {
      // Second line of input: Expecting the array of numbers.
      processingBuffer.push(inputData.split(' ').map(item => parseInt(item, 10))); // Store the array of integers.

      // Perform calculations based on the stored data.
      const calculatedOffsets = generateOffsets(processingBuffer[1]);
      const centralValue = findMiddleValue(calculatedOffsets);
      const finalDeviation = computeTotalDeviation(processingBuffer[1], calculatedOffsets, centralValue);

      // Output the computed result.
      console.log(finalDeviation);

      // Reset the buffer for the next test case.
      processingBuffer = [];
    }
  };
})(); // Immediately invoked function expression to set up the handler.

// Configure standard input to read data.
process.stdin.setEncoding('utf-8');
// Attach an event listener to process incoming data chunks.
process.stdin.on('data', inputDataChunk => processInput(inputDataChunk));
