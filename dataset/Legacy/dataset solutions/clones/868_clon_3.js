const fs = require('fs');

function readAllStdinLines() {
  const fileDescriptor = process.stdin.fd;
  const fileStats = fs.fstatSync(fileDescriptor);
  const totalLength = fileStats.size;
  const dataBuffer = Buffer.alloc(totalLength);
  const actualBytesRead = fs.readSync(fileDescriptor, dataBuffer, 0, totalLength, 0);
  const decodedString = dataBuffer.toString('utf8', 0, actualBytesRead);
  return decodedString.split('\n');
}

let programInput = readAllStdinLines();

function create2DArray(rows, columns, initialValue) {
  const array2D = [];
  for (let r = 0; r < rows; r++) {
    const row = new Array(columns).fill(initialValue);
    array2D.push(row);
  }
  return array2D;
}

function calculateMaxScore(maxTimeCapacity, phrasesData) {
  const numPhrases = phrasesData.length;
  const dpTable = create2DArray(numPhrases + 1, maxTimeCapacity + 1, 0);

  for (let phraseIndex = 0; phraseIndex < numPhrases; phraseIndex++) {
    const currentPhrase = phrasesData[phraseIndex];
    const phraseStartTime = currentPhrase[0];
    const phraseDuration = currentPhrase[1];
    const phrasePoints = currentPhrase[2];

    for (let currentTime = 0; currentTime <= maxTimeCapacity; currentTime++) {
      // Option 1: Do not use the current phrase
      dpTable[phraseIndex + 1][currentTime] = dpTable[phraseIndex][currentTime];

      // Option 2: Consider using the current phrase, if possible
      if (phraseStartTime <= currentTime) {
        let maxPreviousScoreForCurrentPhrase = 0;

        const kLowerBound = Math.max(0, currentTime - phraseDuration);
        const kUpperBound = currentTime - phraseStartTime;

        for (let k = kLowerBound; k <= kUpperBound; k++) {
          if (maxPreviousScoreForCurrentPhrase < dpTable[phraseIndex + 1][k]) {
            maxPreviousScoreForCurrentPhrase = dpTable[phraseIndex + 1][k];
          }
        }
        // Update the DP table entry if using the current phrase yields a better score
        dpTable[phraseIndex + 1][currentTime] = Math.max(
          dpTable[phraseIndex + 1][currentTime],
          maxPreviousScoreForCurrentPhrase + phrasePoints
        );
      }
    }
  }
  return dpTable[numPhrases][maxTimeCapacity];
}

function executeProgram() {
  let currentLineCursor = 0;

  const getNextInteger = () => parseInt(programInput[currentLineCursor++], 10);
  const getNextStringLine = () => programInput[currentLineCursor++];

  const numberOfPhrases = getNextInteger();
  const allPhrases = [];
  for (let i = 0; i < numberOfPhrases; i++) {
    allPhrases.push(getNextStringLine().split(' ').map(Number));
  }

  const numberOfMelodies = getNextInteger();
  const targetMelodyTimes = [];
  for (let i = 0; i < numberOfMelodies; i++) {
    targetMelodyTimes.push(getNextInteger());
  }

  const computedScores = [];
  let allResultsAreValid = true;

  for (const targetTime of targetMelodyTimes) {
    const currentMelodyScore = calculateMaxScore(targetTime, allPhrases);
    if (currentMelodyScore === 0) {
      allResultsAreValid = false;
    }
    computedScores.push(currentMelodyScore);
  }

  if (!allResultsAreValid) {
    console.log(-1);
  } else {
    computedScores.forEach(score => console.log(score));
  }
}

executeProgram();
