(function processInputAndCalculate() {
  const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const trimmedInput = rawInputContent.trim();
  const inputLines = trimmedInput.split('\n');

  const firstLineStr = inputLines[0];
  const targetString = inputLines[1];

  const charCodeOffset = 97;
  const charOffsetArray = [];
  for (let charVal of targetString) {
    charOffsetArray.push(charVal.charCodeAt(0) - charCodeOffset);
  }

  const alphabetSize = 26;
  const frequencyArray = new Array(alphabetSize);
  for (let loopIndex = 0; loopIndex < alphabetSize; loopIndex++) {
    frequencyArray[loopIndex] = 1;
  }

  const primeModulus = 1000000007;

  const performModularMultiplication = (factorA, factorB) => {
    const highBitsA = factorA >>> 16;
    const lowBitsA = factorA & 0xFFFF;

    const productHigh = highBitsA * factorB;
    const productLow = lowBitsA * factorB;

    let termHighMod = (productHigh % primeModulus);
    termHighMod = (termHighMod * 65536) % primeModulus;

    const termLowMod = productLow % primeModulus;

    return (termHighMod + termLowMod) % primeModulus;
  };

  const loopLimit = firstLineStr;
  for (let currentIdx = 0; currentIdx < loopLimit; currentIdx++) {
    const charOffset = charOffsetArray[currentIdx];
    frequencyArray[charOffset]++;
  }

  let accumulatedProduct = 1;
  for (let loopIndex = 0; loopIndex < alphabetSize; loopIndex++) {
    accumulatedProduct = performModularMultiplication(accumulatedProduct, frequencyArray[loopIndex]);
  }

  const finalResult = accumulatedProduct - 1;

  console.log(`${finalResult}`);
})();
