const MOD_VAL = 1000000007;

const createFibonacciResolver = (modulus) => {
  const cache = new Map();
  cache.set(0, 1);
  cache.set(1, 1);

  const resolve = (idx) => {
    if (idx < 0) return 1;
    if (cache.has(idx)) return cache.get(idx);

    const val = (resolve(idx - 1) + resolve(idx - 2)) % modulus;
    cache.set(idx, val);
    return val;
  };
  return resolve;
};

function processInput(sourceText) {
  const lines = sourceText.split('\n');
  const [firstLine, ...remainingLines] = lines;
  const [numN, numM] = firstLine.split(' ').map(Number);
  const initialArr = remainingLines.slice(0, numM).map(Number);

  const hasConsecutiveBlocks = initialArr.slice(1).some((currentVal, index) => {
    const previousVal = initialArr[index];
    return currentVal - previousVal === 1;
  });

  if (hasConsecutiveBlocks) {
    console.log(0);
    return;
  }

  const extendedArr = [-1, ...initialArr, numN + 1];

  const gapLengths = extendedArr.slice(1).map((currentVal, index) => {
    const previousVal = extendedArr[index];
    return currentVal - previousVal - 1;
  });

  const getFibValue = createFibonacciResolver(MOD_VAL);

  const finalProduct = gapLengths.reduce((accumulator, currentDiff) => {
    const fibResult = getFibValue(currentDiff);
    return (accumulator * fibResult) % MOD_VAL;
  }, 1);

  console.log(finalProduct);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
