const inputBuffer = [];
let inputIndex = 0;

const processInput = new Promise(resolve => {
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).on('line', line => inputBuffer.push(line)).on('close', resolve);
});

const parseValue = (token, typeIdentifier) => {
  const conversionMap = new Map([
    [1, val => Number.parseInt(val, 10)],
    [2, val => val.split(' ')],
    [4, val => val.split(' ').map(Number)],
    [6, val => val.split('')],
    [7, val => val.split('').map(Number)],
    [8, arr => arr.join(' ')],
    [9, arr => arr.join('\n')],
    [0, arr => arr.join('')]
  ]);

  const converter = conversionMap.get(typeIdentifier);
  if (converter) {
    try {
      return converter(token);
    } catch (e) {
      return token;
    }
  }
  return token;
};

const retrieveNextToken = () => {
  if (inputIndex < inputBuffer.length) {
    return inputBuffer[inputIndex++];
  }
  throw new Error('No more input available.');
};

const getNextInteger = () => parseValue(retrieveNextToken(), 1);
const getNextIntegerArray = () => parseValue(retrieveNextToken(), 4);

const displayOutput = (content) => console.log(content);
const displayDebug = (content) => console.error('debug:' + require('util').inspect(content, false, null));

const calculatePathCombinations = () => {
  const initialParams = getNextIntegerArray();
  const sequenceLength = initialParams[0];
  const rangeCount = initialParams[1];
  const moduloConstant = 998244353;

  const pathCounts = Array.from({ length: sequenceLength }, () => 0);
  const cumulativePathSums = Array.from({ length: sequenceLength }, () => 0);

  pathCounts[0] = 1;
  cumulativePathSums[0] = 1;

  const jumpRanges = Array.from({ length: rangeCount }, () => getNextIntegerArray());

  const determineRangeContribution = (currentPosition, lowerBound, upperBound, dpArr, sumArr, modVal) => {
    const effectiveLower = currentPosition - lowerBound;
    if (effectiveLower < 0) {
      return 0;
    }

    const termFromLower = sumArr[effectiveLower];
    const effectiveUpperMinusOne = currentPosition - upperBound - 1;

    const termFromUpper = (effectiveUpperMinusOne < 0) ? 0 : sumArr[effectiveUpperMinusOne];

    return (termFromLower - termFromUpper + modVal) % modVal;
  };

  Array.from({ length: sequenceLength - 1 }, (_, idx) => idx + 1).forEach(currentPosition => {
    let currentPositionTotal = 0;

    jumpRanges.forEach(([lowerBound, upperBound]) => {
      const contribution = determineRangeContribution(
        currentPosition,
        lowerBound,
        upperBound,
        pathCounts,
        cumulativePathSums,
        moduloConstant
      );
      currentPositionTotal = (currentPositionTotal + contribution) % moduloConstant;
    });

    pathCounts[currentPosition] = currentPositionTotal;
    cumulativePathSums[currentPosition] = (currentPositionTotal + cumulativePathSums[currentPosition - 1]) % moduloConstant;
  });

  displayOutput(pathCounts[sequenceLength - 1]);
};

processInput.then(() => {
  console.error('\n↑入力 ↓出力');
  calculatePathCombinations();
});
