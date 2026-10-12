let accumulatedInputBuffer = '';

function setupInputListeners() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (inputChunk) => {
    accumulatedInputBuffer += inputChunk;
  });

  process.stdin.on('end', () => {
    const processedLines = accumulatedInputBuffer.split('\n');
    processInputData(processedLines);
  });
}

function processInputData(dataLines) {
  let twoCount = 0;
  const targetChar = '2';
  const firstInputLine = dataLines[0];

  if (!firstInputLine) {
    console.log(0);
    return;
  }

  const countTargetCharOccurrences = (lineString, charToFind) => {
    let currentCount = 0;
    for (let charIdx = 0; charIdx < lineString.length; charIdx++) {
      if (lineString[charIdx] === charToFind) {
        currentCount++;
      }
    }
    return currentCount;
  };

  twoCount = countTargetCharOccurrences(firstInputLine, targetChar);

  console.log(twoCount);
}

function convertLineToNumbers(inputLineStr) {
  if (!inputLineStr || inputLineStr.trim() === '') {
    return [];
  }

  const stringTokens = inputLineStr.split(' ');
  const numericValues = stringTokens.map(token => parseInt(token, 10));

  return numericValues;
}

setupInputListeners();
