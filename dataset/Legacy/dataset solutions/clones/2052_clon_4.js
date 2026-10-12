const memoize = (operation) => {
  const storage = new Map();
  return (...args) => {
    const key = args.join(',');
    if (!storage.has(key)) {
      storage.set(key, operation(...args));
    }
    return storage.get(key);
  };
};

const calculateCombinations = (n, k) => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  if (k > n / 2) {
    k = n - k;
  }

  if (k === 2) {
    return (n * (n - 1)) / 2;
  }

  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
};

const getCombinations = memoize(calculateCombinations);

const processInputData = (rawData) => {
  const lines = rawData.trim().split('\n');
  const numberSequence = lines[1].split(' ');

  const occurrenceMap = new Map();
  for (const numStr of numberSequence) {
    occurrenceMap.set(numStr, (occurrenceMap.get(numStr) || 0) + 1);
  }

  let initialTotalPairs = 0;
  for (const count of occurrenceMap.values()) {
    if (count > 1) {
      initialTotalPairs += getCombinations(count, 2);
    }
  }

  const outputMemo = new Map();

  for (const currentNum of numberSequence) {
    if (outputMemo.has(currentNum)) {
      console.log(outputMemo.get(currentNum));
    } else {
      const originalCount = occurrenceMap.get(currentNum);

      const contributionBeforeRemoval = (originalCount > 1) ? getCombinations(originalCount, 2) : 0;
      const contributionAfterRemoval = (originalCount - 1 > 1) ? getCombinations(originalCount - 1, 2) : 0;

      const currentResult = initialTotalPairs - contributionBeforeRemoval + contributionAfterRemoval;
      outputMemo.set(currentNum, currentResult);
      console.log(currentResult);
    }
  }
};

process.env.MYTEST ? test() : processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
