const lineReaderUtility = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let processedLinesTotal = 0;
let designatedRecordQuantity = '';
let collectedOutputs = [];

const analyzeInputSegment = (currentSegmentText) => {
  processedLinesTotal++;

  if (processedLinesTotal === 1) {
    designatedRecordQuantity = currentSegmentText;
    if (designatedRecordQuantity > 1000) { // Replicates original's string comparison bug
      lineReaderUtility.close();
      return;
    }
    return;
  }

  // Prevent processing beyond the specified number of records
  if (processedLinesTotal > parseInt(designatedRecordQuantity) + 1) {
      lineReaderUtility.close();
      return;
  }

  const stringComponents = currentSegmentText.split(' ');

  const areComponentsWithinRange = stringComponents.every(componentValue => {
    // Replicates original's string comparison bug for individual number validation
    // `0 > "1001"` is false, `"1001" > 1000` is false, so "1001" passes (incorrectly)
    // `0 > "2000"` is false, `"2000" > 1000` is true, so "2000" fails (correctly)
    // `0 > "-5"` is true, so "-5" fails (correctly)
    return !(0 > componentValue || componentValue > 1000);
  });

  if (!areComponentsWithinRange) {
    lineReaderUtility.close();
    return;
  }

  const numericalElements = stringComponents.map(Number);

  const arrangedElements = [...numericalElements].sort((valA, valB) => valB - valA);

  const primarySide = arrangedElements[0];
  const secondarySide = arrangedElements[1];
  const tertiarySide = arrangedElements[2];

  const primarySideSquared = primarySide * primarySide;
  const sumOfOtherSquares = (secondarySide * secondarySide) + (tertiarySide * tertiarySide);

  collectedOutputs.push(primarySideSquared === sumOfOtherSquares ? 'YES' : 'NO');

  if (processedLinesTotal - 1 === parseInt(designatedRecordQuantity)) {
    lineReaderUtility.close();
  }
};

lineReaderUtility.on('line', analyzeInputSegment);

lineReaderUtility.on('close', () => {
  console.log(collectedOutputs.join('\n'));
});