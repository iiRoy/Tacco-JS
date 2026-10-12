const processInput = (rawData) => {
  const inputLines = rawData.trim().split('\n');
  const numberStrings = inputLines[1].split(' ');

  const frequencyMap = {};
  for (let idx = 0; idx < numberStrings.length; idx++) {
    const currentNumStr = numberStrings[idx];
    frequencyMap[currentNumStr] = (frequencyMap[currentNumStr] || 0) + 1;
  }

  const resultCache = {};

  const computeCombinationsSum = (currentFreqMap, combinationCalculator) => {
    let totalCombinations = 0;
    const counts = Object.values(currentFreqMap);
    for (let j = 0; j < counts.length; j++) {
      const countValue = counts[j];
      if (countValue > 1) {
        totalCombinations += combinationCalculator(countValue, 2);
      }
    }
    return totalCombinations;
  };

  for (let idx = 0; idx < numberStrings.length; idx++) {
    const currentNumber = numberStrings[idx];

    frequencyMap[currentNumber] -= 1;

    if (!resultCache[currentNumber]) {
      const calculatedSum = computeCombinationsSum(frequencyMap, memoizedCombinations);
      resultCache[currentNumber] = calculatedSum;
    }
    console.log(resultCache[currentNumber]);

    frequencyMap[currentNumber] += 1;
  }
};

const calculateCombinations = (nValue, kValue) => {
  let productNumerator = 1;
  let tempN = nValue;
  for (let i = 0; i < kValue; i++) {
    productNumerator *= tempN;
    tempN--;
  }

  let productDenominator = 1;
  let tempK = kValue;
  while (tempK > 0) {
    productDenominator *= tempK;
    tempK--;
  }

  return productNumerator / productDenominator;
};

const memoizeFunction = (targetFunction) => {
  const memoStorage = {};
  return (n, k) => {
    const cacheKey = `${n}C${k}`;
    if (!memoStorage[cacheKey]) {
      memoStorage[cacheKey] = targetFunction(n, k);
    }
    return memoStorage[cacheKey];
  };
};

const memoizedCombinations = memoizeFunction(calculateCombinations);

process.env.MYTEST ? test() : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
