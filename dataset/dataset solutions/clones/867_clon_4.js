const lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const receivedLines = [];
lineReader.on('line', (currentLine) => {
  receivedLines.push(currentLine);
});

lineReader.on('close', () => {
  orchestrateProgram(receivedLines);
});

const createGrid = (rowCount, colCount, initialValue) =>
  Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, () => initialValue)
  );

const calculateMaxScore = (totalDuration, musicalPhrases) => {
  const phraseCount = musicalPhrases.length;

  const initialScoreTable = [Array(totalDuration + 1).fill(0)];

  const fullScoreTable = musicalPhrases.reduce((accumulatedTable, currentPhrase, phraseIndex) => {
    const [startCost, durationLength, profitValue] = currentPhrase;
    const previousRow = accumulatedTable[phraseIndex];

    const currentRow = Array(totalDuration + 1);

    for (let currentDur = 0; currentDur <= totalDuration; currentDur++) {
      const scoreFromPreviousPhrase = previousRow[currentDur];

      let scoreIfPhraseTaken = -Infinity;
      if (startCost <= currentDur) {
        const lowerBound = Math.max(0, currentDur - durationLength);
        const upperBound = currentDur - startCost;

        let maxPreviousCurrentRowScore = -Infinity;
        for (let k = lowerBound; k <= upperBound; k++) {
          if (k >= 0 && k <= totalDuration) {
            maxPreviousCurrentRowScore = Math.max(maxPreviousCurrentRowScore, currentRow[k]);
          }
        }
        
        if (maxPreviousCurrentRowScore !== -Infinity) {
            scoreIfPhraseTaken = maxPreviousCurrentRowScore + profitValue;
        }
      }
      currentRow[currentDur] = Math.max(scoreFromPreviousPhrase, scoreIfPhraseTaken);
    }

    accumulatedTable.push(currentRow);
    return accumulatedTable;
  }, initialScoreTable);

  return fullScoreTable[phraseCount][totalDuration];
};

const orchestrateProgram = (allInputLines) => {
  let lineCursor = 0;
  const getNextLine = () => allInputLines[lineCursor++];

  const phraseCount = Number(getNextLine());
  const musicalPhrases = Array.from({ length: phraseCount }, () =>
    getNextLine().split(' ').map(Number)
  ).sort((a, b) => a[2] - b[2]);

  const queryCount = Number(getNextLine());
  const durationQueries = Array.from({ length: queryCount }, () =>
    Number(getNextLine())
  );

  const { finalScores, zeroScoreEncountered } = durationQueries.reduce(
    (accumulator, currentDuration) => {
      const currentMaxScore = calculateMaxScore(currentDuration, musicalPhrases);
      if (currentMaxScore === 0) {
        accumulator.zeroScoreEncountered = true;
      } else {
        accumulator.finalScores.push(currentMaxScore);
      }
      return accumulator;
    },
    { finalScores: [], zeroScoreEncountered: false }
  );

  if (zeroScoreEncountered) {
    console.log(-1);
  } else {
    finalScores.forEach(console.log);
  }
};
