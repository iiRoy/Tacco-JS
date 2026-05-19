process.stdin.resume();
process.stdin.setEncoding('utf-8');

let rawInputData = '';
let lineIndex = 0;

process.stdin.on('data', chunkOfData => {
    rawInputData += chunkOfData;
});

process.stdin.on('end', _ => {
    rawInputData = rawInputData.trim().split('\n').map(lineStr => {
        return lineStr.trim();
    });

    executeProgram();
});

function fetchNextLine() {
    return rawInputData[lineIndex++];
}

function executeProgram() {
  const totalElements = Number(fetchNextLine());
  const charSequence = fetchNextLine();
  let startIndex = 0, endIndex = totalElements - 1;
  let swapCount = 0;
  const redChar = 'R', whiteChar = 'W';

  while (startIndex <= endIndex) {
    let whiteFound = false;
    let redFound = false;
    for (let currentPos = startIndex; currentPos < endIndex; currentPos++) {
      if (charSequence[currentPos] === redChar) {
        continue;
      }
      whiteFound = true;
      redFound = false;
      for (let reversePos = endIndex; reversePos > currentPos; reversePos--) {
        if (charSequence[reversePos] === whiteChar) {
          continue;
        }
        endIndex = reversePos - 1;
        swapCount += 1;
        redFound = true;
        break;
      }
      if (!redFound) {
        break;
      }
      startIndex = currentPos + 1;
      break;
    }
    if (!whiteFound || !redFound) {
      break;
    }
  }
  console.log(swapCount);
}
