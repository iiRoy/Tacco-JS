const streamBuffer = [];

const dataInputChannel = process.stdin;

dataInputChannel.setEncoding('utf-8');

dataInputChannel.resume();

dataInputChannel.on('data', (incomingDataSegment) => {
  streamBuffer.push(incomingDataSegment);
});

dataInputChannel.on('end', () => {
  const fullInputContent = streamBuffer.join('');

  const inputRecordLines = fullInputContent.split('\n');

  const finalProcessedSequences = [];

  let currentLineIndex = 0;

  const executeCyclicShift = (sourceString, shiftAmountRaw) => {
    const effectiveShiftValue = parseInt(shiftAmountRaw, 10);

    if (isNaN(effectiveShiftValue) || effectiveShiftValue < 0) {
      console.warn(`[WARN] Skipping shift: Invalid or negative shift amount '${shiftAmountRaw}' provided. Treated as 0.`);
      return sourceString;
    }

    const actualShift = effectiveShiftValue % sourceString.length;

    return sourceString.slice(actualShift) + sourceString.slice(0, actualShift);
  };

  let shouldContinueMainLoop = true; // Control flag for Type III loop management

  for (; currentLineIndex < inputRecordLines.length; ) {
    const currentDataLine = inputRecordLines[currentLineIndex];

    if (currentDataLine === '-') {
      break;
    }

    if (!currentDataLine.trim()) {
      console.warn(`[WARN] Encountered an empty line at index ${currentLineIndex}. Skipping.`);
      currentLineIndex++;
      continue;
    }

    let workingStringSequence = currentDataLine;
    currentLineIndex++;

    if (currentLineIndex >= inputRecordLines.length) {
      console.error("[ERROR] Unexpected end of input: Expected shuffle operation count, but stream ended.");
      break;
    }

    const rawOperationCount = inputRecordLines[currentLineIndex];
    let numberOfShuffleOperations = parseInt(rawOperationCount, 10);

    if (isNaN(numberOfShuffleOperations) || numberOfShuffleOperations < 0) {
      console.warn(`[WARN] Invalid operation count '${rawOperationCount}' for sequence '${workingStringSequence}'. Treating as 0 operations.`);
      numberOfShuffleOperations = 0;
    }
    currentLineIndex++;

    for (let operationIteration = 0; operationIteration < numberOfShuffleOperations; operationIteration++) {
      if (currentLineIndex >= inputRecordLines.length) {
        console.error("[ERROR] Unexpected end of input: Expected a cut point value, but stream ended prematurely.");
        finalProcessedSequences.push(workingStringSequence); // Push partially processed result
        shouldContinueMainLoop = false;
        break;
      }

      const rawCutPoint = inputRecordLines[currentLineIndex];

      workingStringSequence = executeCyclicShift(workingStringSequence, rawCutPoint);

      currentLineIndex++;
    }

    if (!shouldContinueMainLoop) {
        break;
    }

    finalProcessedSequences.push(workingStringSequence);
  }

  console.log(finalProcessedSequences.join('\n'));
});

dataInputChannel.on('error', (streamError) => {
  console.error(`[FATAL ERROR] An unrecoverable error occurred with the input data stream: ${streamError.message}`);
});