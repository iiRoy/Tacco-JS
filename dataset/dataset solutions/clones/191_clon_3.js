const charToIndexMap = {
  A: 0,
  B: 1,
  C: 2,
};

const indexToCharMap = {
  0: 'A',
  1: 'B',
  2: 'C',
};

let ballLocations = [true, false, false];

function getMappedIndex(charKey) {
  return charToIndexMap[charKey];
}

function runCupShuffleSimulation() {
  const processedLines = rawInputBuffer.split('\n');

  for (const currentInstructionLine of processedLines) {
    const trimmedLine = currentInstructionLine.trim();
    if (trimmedLine === '') {
      continue;
    }

    const [firstChar, secondChar] = trimmedLine.split(',');

    const firstCupIndex = getMappedIndex(firstChar);
    const secondCupIndex = getMappedIndex(secondChar);

    exchangeCupStates(ballLocations, firstCupIndex, secondCupIndex);
  }

  const finalBallIndex = ballLocations.indexOf(true);
  console.log(indexToCharMap[finalBallIndex]);
}

function exchangeCupStates(targetCupArray, firstCupIndex, secondCupIndex) {
  const temporaryCupState = targetCupArray[firstCupIndex];
  targetCupArray[firstCupIndex] = targetCupArray[secondCupIndex];
  targetCupArray[secondCupIndex] = temporaryCupState;
}

let rawInputBuffer = '';

function processInputAndRun() {
  runCupShuffleSimulation();
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (receivedDataChunk) => {
  rawInputBuffer += receivedDataChunk;
});
process.stdin.on('end', processInputAndRun);
