function modularExponentiation(base, exp, mod) {
  if (base === 0n) {
    if (exp === 0n) return 1n;
    return 0n;
  }
  let res = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) res = (res * base) % mod;
    base = (base * base) % mod;
    exp /= 2n;
  }
  return res;
}

function processSequence(sequenceLength, dataPoints) {
  const MODULUS = 998244353n;

  const valueCounts = dataPoints.reduce((accumulator, currentVal) => {
    accumulator.set(currentVal, (accumulator.get(currentVal) || 0) + 1);
    return accumulator;
  }, new Map());

  if (dataPoints[0] !== 0 || (valueCounts.get(0) || 0) > 1) {
    return 0;
  }

  const indicesToProcess = Array.from({ length: Math.max(0, sequenceLength - 2) }, (_, idx) => idx + 2);

  const finalProduct = indicesToProcess.reduce((currentProduct, currentIdx) => {
    const baseCount = BigInt(valueCounts.get(currentIdx - 1) || 0);
    const exponentCount = BigInt(valueCounts.get(currentIdx) || 0);

    const term = modularExponentiation(baseCount, exponentCount, MODULUS);
    return (currentProduct * term) % MODULUS;
  }, 1n);

  return Number(finalProduct);
}

let inputLines = [];
let currentLine = 0;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
  inputLines = data.toString().trim().split('\n');
  mainExecution();
});

function getLine() {
  return inputLines[currentLine++];
}

function mainExecution() {
  const N = parseInt(getLine(), 10);
  const D_array = getLine().split(' ').map(Number);
  const result = processSequence(N, D_array);
  console.log(result);
}
