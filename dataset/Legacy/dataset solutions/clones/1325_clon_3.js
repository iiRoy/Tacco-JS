let rawInputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', dataChunk => {
  rawInputBuffer += dataChunk;
});

process.stdin.on('end', () => {
  const extractInitialData = (fullContent) => {
    const trimmedContent = fullContent.trim();
    const allInputLines = trimmedContent.split('\n');
    const initialStringValue = allInputLines[0];
    const subsequentInstructionLines = allInputLines.slice(1);
    return { initialStringValue, subsequentInstructionLines };
  };

  const { initialStringValue, subsequentInstructionLines } = extractInitialData(rawInputBuffer);
  let currentProcessedString = initialStringValue;
  const finalOutputStrings = [];

  let lineIterator = 0;
  while (lineIterator < subsequentInstructionLines.length) {
    const currentInstructionLine = subsequentInstructionLines[lineIterator];
    const parsedShiftMagnitude = parseInt(currentInstructionLine, 10);

    if (!isNaN(parsedShiftMagnitude)) {
      currentProcessedString = rotateString(currentProcessedString, parsedShiftMagnitude);
      lineIterator++;
    } else {
      finalOutputStrings.push(currentProcessedString);
      currentProcessedString = currentInstructionLine;
      lineIterator += 2;
    }
  }

  console.log(finalOutputStrings.join('\n'));
});

const rotateString = (sourceString, rotationAmount) => {
  const prefixToMove = sourceString.slice(rotationAmount);
  const suffixToKeep = sourceString.slice(0, rotationAmount);
  return prefixToMove + suffixToKeep;
};
