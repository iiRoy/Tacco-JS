let inputLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  processInputData(inputLines);
});

function checkPrimeStatus(candidateNum) {
    if (candidateNum === 1) {
        return false;
    }
    let isCandidatePrime = true;

    if (candidateNum === 2) {
        return true;
    }

    if (candidateNum < 2) {
        return false;
    }
    const EVEN_DIVISOR = 2;
    if (candidateNum % EVEN_DIVISOR === 0) {
        return false;
    }

    const squareRootLimit = Math.sqrt(candidateNum);
    for (let currentDivisor = 3; currentDivisor * currentDivisor <= candidateNum; currentDivisor += 2) {
      if (candidateNum % currentDivisor === 0) {
        isCandidatePrime = false;
        break;
      }
    }
    
    return isCandidatePrime;
}

function processInputData(dataLines) {
  const firstLineValue = dataLines[0];
  const totalNumbersToProcess = parseInt(firstLineValue);
  
  dataLines.shift();
  
  let foundPrimeCount = 0;
  for (let loopIndex = 0; loopIndex < totalNumbersToProcess; loopIndex++) {
    const currentLineValue = dataLines[loopIndex];
    const parsedNumber = parseInt(currentLineValue);
    if (checkPrimeStatus(parsedNumber)) {
      foundPrimeCount++;
    }
  }
  
  console.log(foundPrimeCount);
}
