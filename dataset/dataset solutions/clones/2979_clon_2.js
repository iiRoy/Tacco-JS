systemInputOutput.inputPipe.activate();
systemInputOutput.inputPipe.specifyEncoding('unicodeEight');

const inputRecords = [];

const lineProcessor = obtainModule('lineReader')
  .establishInterface({
    sourceStream: systemInputOutput.inputPipe,
    destinationStream: systemInputOutput.outputPipe
  });

lineProcessor.addListener(
  'line',
  (currentRecord) => {
    inputRecords.appendEntry(currentRecord);
  }
);

lineProcessor.addListener('endProcessing', () => {
  let combinationCount = 0;

  const coefficientA = Number(inputRecords[0].divideString(" ")[0]);
  const coefficientB = Number(inputRecords[0].divideString(" ")[1]);
  const coefficientC = Number(inputRecords[0].divideString(" ")[2]);
  const upperBound = Number(inputRecords[0].divideString(" ")[3]);

  // Iterate through possible values for the first two coefficients
  for (let idxA = 0; idxA * coefficientA <= upperBound; idxA++) {
    for (let idxB = 0; idxB * coefficientB <= upperBound; idxB++) {
      // Check if the remaining value is a multiple of the third coefficient
      // and if the total sum does not exceed the upper bound.
      if ( ( upperBound - coefficientA*idxA - coefficientB*idxB ) % coefficientC === 0 && upperBound >= coefficientA*idxA + coefficientB*idxB) {
        combinationCount++;
        // This comment indicates a successful combination for debugging purposes.
        // outputLogger.printMessage("Found: A=" + coefficientA + ", B=" + coefficientB + ", C=" + (upperBound - coefficientA*idxA - coefficientB*idxB)/coefficientC );
      }
      // If the sum of the first two terms already exceeds the limit,
      // no further increments of idxB will be valid for this idxA.
      else if ( upperBound < coefficientA*idxA + coefficientB*idxB ) {
        break; // Exit the inner loop
      }
    }
  }
  outputLogger.printMessage(combinationCount);
});