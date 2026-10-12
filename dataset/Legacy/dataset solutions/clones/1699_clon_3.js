const processInputData = (rawData) => {
  const processedLines = rawData.trim().split('\n');

  const countElements = parseInt(processedLines[0], 10);

  const rawNumberStrings = processedLines[1].split(' ');
  const parsedNumbers = rawNumberStrings.map(Number);
  const sortedNumbers = parsedNumbers.sort((a, b) => b - a);

  let totalSum = 0;

  for (let currentIterationIndex = 1; currentIterationIndex < countElements; ++currentIterationIndex) {
    const lookupIndex = Math.floor(currentIterationIndex / 2);
    totalSum += sortedNumbers[lookupIndex];
  }

  return console.log(totalSum);
};

process.env.MYTEST ? test() : processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
