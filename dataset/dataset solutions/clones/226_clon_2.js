var fileSys = require('fs');
var dataSize = fileSys.fstatSync(process.stdin.fd).size;
var tempBuffer = Buffer.alloc(dataSize);
var readBytes = fileSys.readSync(process.stdin.fd, tempBuffer, 0, dataSize, 0);
var inputLines = tempBuffer.toString('utf8', 0, readBytes).split('\n');
beginProcessing();

function beginProcessing() {
  const sumOccurrences = generateSumCounts();

  let lineIndex = 0;
  while (currentValue = +inputLines[lineIndex++]) {
    console.log(sumOccurrences[currentValue]);
  }
}

function generateSumCounts() {
  const UPPER_BOUND = 50000;
  const SIEVE_LIMIT = Math.floor(Math.sqrt(UPPER_BOUND));

  var isNotPrime = new Uint8Array(UPPER_BOUND + 1);
  var sumFrequencies = new Uint16Array(UPPER_BOUND + 1);
  var primeList = new Uint16Array(5134); // ~pi(50000)

  isNotPrime[0] = isNotPrime[1] = 1; // Mark 0 and 1 as non-prime

  // Sieve of Eratosthenes to identify composite numbers
  for (let sieveIndex = 2; sieveIndex <= SIEVE_LIMIT; sieveIndex++) {
    if (isNotPrime[sieveIndex]) {
      continue;
    }

    for (let multipleIndex = (sieveIndex << 1); multipleIndex <= UPPER_BOUND; multipleIndex += sieveIndex) {
      isNotPrime[multipleIndex] = 1;
    }
  }

  let primeCounter = 0;
  // Calculate frequencies of sums of two primes
  for (let currentNumber = 1; currentNumber <= UPPER_BOUND; currentNumber++) {
    if (isNotPrime[currentNumber])
      continue;
    
    primeList[++primeCounter] = currentNumber; // Add current prime to list
    
    for (let prevPrimeIdx = 1; prevPrimeIdx <= primeCounter; prevPrimeIdx++) {
      let pairSum = currentNumber + primeList[prevPrimeIdx];
      if (pairSum > UPPER_BOUND)
        break;
      
      sumFrequencies[pairSum]++;
    }
  }
     
  return sumFrequencies;
}