const generatePrimesUpTo = (upperLimit) => {
  const primeCandidates = [2];
  if (upperLimit < 2) {
    return [];
  }

  for (let currentNumber = 3; currentNumber <= upperLimit; currentNumber += 2) {
    let isCurrentNumberPrime = true;
    for (let divisorIndex = 0;
         divisorIndex < primeCandidates.length && primeCandidates[divisorIndex] * primeCandidates[divisorIndex] <= currentNumber;
         divisorIndex++) {
      if (currentNumber % primeCandidates[divisorIndex] === 0) {
        isCurrentNumberPrime = false;
        break;
      }
    }
    if (isCurrentNumberPrime) {
      primeCandidates.push(currentNumber);
    }
  }
  return primeCandidates;
};

const createPrimeLookupMap = (primeArray) => {
  const primeExistenceMap = {};
  for (const primeValue of primeArray) {
    primeExistenceMap[primeValue] = true;
  }
  return primeExistenceMap;
};

const primeNumbersList = generatePrimesUpTo(50000);
const isPrimeLookup = createPrimeLookupMap(primeNumbersList);

const countGoldbachPairs = (targetSum, maxPrimeComponent, primesArray, primeCheckMap) => {
  let foundPairCount = 0;
  for (let primeIterator = 0; primeIterator < primesArray.length; primeIterator++) {
    const currentPrime = primesArray[primeIterator];
    if (currentPrime > maxPrimeComponent) {
      break;
    }

    const complementValue = targetSum - currentPrime;
    if (primeCheckMap[complementValue]) {
      foundPairCount++;
    }
  }
  return foundPairCount;
};

const executeInputProcessing = (inputLines) => {
  const totalLines = inputLines.length;
  for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
    const currentLineContent = inputLines[lineIndex];
    const targetNumber = parseInt(currentLineContent, 10);

    if (targetNumber === 0) {
      break;
    }

    const halfTarget = Math.floor(targetNumber / 2);

    const pairsResult = countGoldbachPairs(targetNumber, halfTarget, primeNumbersList, isPrimeLookup);
    console.log(pairsResult);
  }
};

let rawInputAccumulator = '';

const initializeInputHandlers = () => {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (dataChunk) => {
    rawInputAccumulator += dataChunk;
  });

  process.stdin.on('end', () => {
    const processedInputLines = rawInputAccumulator.split('\n');
    executeInputProcessing(processedInputLines);
  });
};

initializeInputHandlers();
