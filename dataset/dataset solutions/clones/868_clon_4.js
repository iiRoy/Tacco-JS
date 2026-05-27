const createGrid = (rows, cols, initialValue) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => initialValue));

const calculateOptimalScore = (targetLength, phraseDefinitions) => {
  const phraseCount = phraseDefinitions.length;
  const scoreTable = createGrid(phraseCount + 1, targetLength + 1, 0);

  phraseDefinitions.forEach((currentPhrase, phraseIndex) => {
    const [startPoint, minLength, profitValue] = currentPhrase;
    Array.from({ length: targetLength + 1 }, (_, currentLength) => currentLength).forEach(currentLength => {
      const previousPhraseScore = scoreTable[phraseIndex][currentLength];
      let currentPhraseMaxScore = previousPhraseScore;

      if (startPoint <= currentLength) {
        const lowerBound = Math.max(0, currentLength - minLength);
        const upperBound = currentLength - startPoint;

        let rangeMax = 0;
        if (upperBound >= lowerBound) {
          rangeMax = Array.from({ length: upperBound - lowerBound + 1 }, (_, idx) => scoreTable[phraseIndex + 1][lowerBound + idx])
                       .reduce((accumulator, value) => Math.max(accumulator, value), 0);
        }
        currentPhraseMaxScore = Math.max(previousPhraseScore, rangeMax + profitValue);
      }
      scoreTable[phraseIndex + 1][currentLength] = currentPhraseMaxScore;
    });
  });
  return scoreTable[phraseCount][targetLength];
};

const processInputAndExecute = () => {
  const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  let inputCursor = 0;

  const getNextLine = () => rawInput[inputCursor++];
  const parseNumericLine = () => parseInt(getNextLine(), 10);
  const parsePhraseLine = () => getNextLine().split(' ').map(Number);

  const definitionCount = parseNumericLine();
  const phraseDefinitions = Array.from({ length: definitionCount }, parsePhraseLine);

  const melodyQueryCount = parseNumericLine();
  const melodyQueries = Array.from({ length: melodyQueryCount }, parseNumericLine);

  const results = melodyQueries.map(queryLength =>
    calculateOptimalScore(queryLength, phraseDefinitions)
  );

  if (results.some(res => res === 0)) {
    console.log(-1);
  } else {
    console.log(results.join('\n'));
  }
};

processInputAndExecute();
