const PRIME_MODULUS = 998244353n;

function modularPower(base, exponent) {
  let result = 1n;
  let currentBase = base % PRIME_MODULUS;
  let currentExponent = exponent;

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % PRIME_MODULUS;
    }
    currentBase = (currentBase * currentBase) % PRIME_MODULUS;
    currentExponent /= 2n;
  }
  return result;
}

function modularInverse(number) {
  return modularPower(number, PRIME_MODULUS - 2n);
}

let factorialCache = [];
let inverseFactorialCache = [];

function initializeFactorialCaches(limit) {
  factorialCache = new Array(limit + 1).fill(0n);
  inverseFactorialCache = new Array(limit + 1).fill(0n);

  factorialCache[0] = 1n;
  for (let i = 1; i <= limit; i++) {
    factorialCache[i] = (factorialCache[i - 1] * BigInt(i)) % PRIME_MODULUS;
  }

  inverseFactorialCache[limit] = modularInverse(factorialCache[limit]);
  for (let i = limit - 1; i >= 0; i--) {
    inverseFactorialCache[i] = (inverseFactorialCache[i + 1] * BigInt(i + 1)) % PRIME_MODULUS;
  }
}

function getBinomialCoefficient(n, k) {
  if (k < 0n || k > n) {
    return 0n;
  }
  if (k === 0n || k === n) {
    return 1n;
  }
  if (k > n / 2n) {
    k = n - k;
  }
  return (factorialCache[Number(n)] * inverseFactorialCache[Number(k)] % PRIME_MODULUS * inverseFactorialCache[Number(n - k)] % PRIME_MODULUS) % PRIME_MODULUS;
}

function processInput(inputString) {
  const lines = inputString.split("\n");
  const params = lines[0].split(" ").map(BigInt);

  const itemCount = params[0];
  const colorCount = params[1];
  const maxAllowedK = params[2];

  initializeFactorialCaches(Number(itemCount - 1n));

  let currentFactor;
  const baseForIteration = colorCount - 1n;
  const loopExponentCount = itemCount - 2n - maxAllowedK;

  if (loopExponentCount >= 1n) {
    if (baseForIteration === 0n) {
      currentFactor = 0n;
    } else {
      currentFactor = modularPower(baseForIteration, loopExponentCount + 1n);
    }
  } else {
    currentFactor = baseForIteration;
  }

  if (currentFactor === 0n) {
    currentFactor = 1n;
  }

  let cumulativeSum = 0n;

  for (let i = maxAllowedK; i >= 0n; i--) {
    const coefficient = getBinomialCoefficient(itemCount - 1n, i);
    let termValue = (coefficient * colorCount) % PRIME_MODULUS;
    termValue = (termValue * currentFactor) % PRIME_MODULUS;
    cumulativeSum = (cumulativeSum + termValue) % PRIME_MODULUS;

    currentFactor = (currentFactor * baseForIteration) % PRIME_MODULUS;
  }

  console.log('%s', cumulativeSum.toString());
  return cumulativeSum;
}

function testFunction(n) {
  var input = document.getElementById("input" + n).value;
  var ans = processInput(input);
  var result = "WA";
  if (ans == document.getElementById("output" + n).value.split("\n")[0]) {
    result = "AC";
  }
  document.getElementById("result" + n).innerHTML = result;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
