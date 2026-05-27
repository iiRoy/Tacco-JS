process.stdin.resume();
process.stdin.setEncoding('utf-8');

let rawInputData = '';
let lineIndex = 0;

process.stdin.on('data', inputChunk => {
    rawInputData += inputChunk;
});

process.stdin.on('end', () => {
    const processedLines = rawInputData.trim().split('\n').map(lineStr => {
        return lineStr.trim();
    });
    rawInputData = processedLines;
    executeProgram();
});

function fetchNextLine() {
    return rawInputData[lineIndex++];
}

function executeProgram() {
  const totalElements = Number(fetchNextLine());
  const charSequence = fetchNextLine();
  let startIndex = 0;
  let endIndex = totalElements - 1;
  let swapCount = 0;
  const redChar = 'R';
  const whiteChar = 'W';

  // Helper function to locate the first 'W' (character not equal to targetRedChar) from the left
  const findFirstWhiteFromLeft = (sequence, currentStart, currentEnd, targetRedChar) => {
      for (let k = currentStart; k < currentEnd; k++) {
          if (sequence[k] !== targetRedChar) {
              return k; // Found a 'W' at index k
          }
      }
      return -1; // No 'W' found in the specified range
  };

  // Helper function to locate the first 'R' (character not equal to targetWhiteChar) from the right
  const findFirstRedFromRight = (sequence, currentStart, currentEnd, targetWhiteChar) => {
      for (let k = currentEnd; k > currentStart; k--) {
          if (sequence[k] !== targetWhiteChar) {
              return k; // Found an 'R' at index k
          }
      }
      return -1; // No 'R' found in the specified range
  };

  while (startIndex <= endIndex) {
    const potentialWhitePos = findFirstWhiteFromLeft(charSequence, startIndex, endIndex, redChar);

    // If no 'W' is found from the left, or the pointers have crossed, the process is complete.
    if (potentialWhitePos === -1) {
      break;
    }

    const potentialRedPos = findFirstRedFromRight(charSequence, potentialWhitePos, endIndex, whiteChar);

    // If no 'R' is found from the right for the current 'W', the process is complete.
    if (potentialRedPos === -1) {
      break;
    }

    // Both a 'W' and an 'R' were found in their respective positions.
    // Conceptually swap them and update the pointers for the next iteration.
    swapCount += 1;
    endIndex = potentialRedPos - 1;
    startIndex = potentialWhitePos + 1;
  }
  console.log(swapCount);
}
