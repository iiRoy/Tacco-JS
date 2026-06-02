let accumulatedRawInput = '';

function processInputAndExecute() {
  function checkStackPartitionability(remainingItems, leftSequence, rightSequence) {
    if (remainingItems.length === 0) {
      return true;
    }

    const currentItem = remainingItems[0];
    const subsequentItems = remainingItems.slice(1);

    const canPlaceOnLeft = (currentItem > leftSequence[0]) &&
                           checkStackPartitionability(subsequentItems, [currentItem, ...leftSequence], rightSequence);

    const canPlaceOnRight = (currentItem > rightSequence[0]) &&
                            checkStackPartitionability(subsequentItems, leftSequence, [currentItem, ...rightSequence]);

    return canPlaceOnLeft || canPlaceOnRight;
  }

  const processedInputLines = accumulatedRawInput.split('\n');
  const totalTestCases = parseInt(processedInputLines[0], 10);
  const testCaseDataLines = processedInputLines.slice(1);

  for (let testCaseIdx = 0; testCaseIdx < totalTestCases; testCaseIdx++) {
    const currentTestCaseString = testCaseDataLines[testCaseIdx];
    const numbersForPartition = currentTestCaseString.split(' ').map(parseFloat);

    const initialLeftStackBase = [0];
    const initialRightStackBase = [0];

    const isPartitionPossible = checkStackPartitionability(
      numbersForPartition,
      initialLeftStackBase,
      initialRightStackBase
    );

    const outputMessage = isPartitionPossible ? 'YES' : 'NO';
    console.log(outputMessage);
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingDataChunk) {
  accumulatedRawInput += incomingDataChunk;
});

process.stdin.on('end', function() {
  processInputAndExecute();
});
