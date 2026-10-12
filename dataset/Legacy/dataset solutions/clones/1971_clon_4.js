const getModInverse = (val, modulus) => {
  let m0 = modulus;
  let y = 0, x = 1;
  if (modulus === 1) return 0;
  while (val > 1) {
    let q = Math.floor(val / m0);
    let t = m0;
    m0 = val % m0, val = t;
    t = y;
    y = x - q * y;
    x = t;
  }
  if (x < 0) x += modulus;
  return x;
};

const addMod = (a, b, m) => (a + b) % m;
const subMod = (a, b, m) => (a - b % m + m) % m;
const mulMod = (a, b, m) => (1.0 * a * b) % m; // Use 1.0 * a to prevent potential overflow before modulo for large numbers

const calculateSumUpTo = (limit, modulus, invTwo) => {
  if (limit < 0) return 0;
  let term1 = limit % modulus;
  let term2 = (limit + 1) % modulus;
  let product = mulMod(term1, term2, modulus);
  return mulMod(product, invTwo, modulus);
};

const calculateSumSquaresUpTo = (limit, modulus, invSix) => {
  if (limit < 0) return 0;
  let term1 = limit % modulus;
  let term2 = (limit + 1) % modulus;
  let term3 = (2 * limit + 1) % modulus;
  let product = mulMod(term1, term2, modulus);
  product = mulMod(product, term3, modulus);
  return mulMod(product, invSix, modulus);
};

const processInputAndCompute = (inputString) => {
  const modulus = 10**9 + 7;
  const [numN, numK] = inputString.trim().split(' ').map(Number);

  const invTwo = getModInverse(2, modulus);
  const invSix = getModInverse(6, modulus);

  const upperLimitForSummation = numN + 1;
  const lowerLimitMinusOneForSummation = numK - 1;

  const sumOfConstantTerms = subMod(upperLimitForSummation, lowerLimitMinusOneForSummation, modulus);

  const sumOfLinearTerms = subMod(
    calculateSumUpTo(upperLimitForSummation, modulus, invTwo),
    calculateSumUpTo(lowerLimitMinusOneForSummation, modulus, invTwo),
    modulus
  );

  const sumOfQuadraticTerms = subMod(
    calculateSumSquaresUpTo(upperLimitForSummation, modulus, invSix),
    calculateSumSquaresUpTo(lowerLimitMinusOneForSummation, modulus, invSix),
    modulus
  );

  let componentOne = subMod(0, sumOfQuadraticTerms, modulus);
  let componentTwo = mulMod(addMod(numN, 1, modulus), sumOfLinearTerms, modulus);
  let componentThree = sumOfConstantTerms;

  let finalResult = addMod(componentOne, componentTwo, modulus);
  finalResult = addMod(finalResult, componentThree, modulus);

  console.log(finalResult);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInputAndCompute(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
