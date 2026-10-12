// 標準入力
var fileSystemModule = require('fs');
var standardInputFD = process.stdin.fd;
var bufferSize = fileSystemModule.fstatSync(standardInputFD).size;
var inputBuffer = new Buffer(bufferSize);
var actualBytesRead = fileSystemModule.readSync(standardInputFD, inputBuffer, 0, bufferSize, 0);
var rawInputLines = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Execute the primary logic
processData();

// Main function renamed and modified
function processData() {
    const MAX_PRIME_SUM_VALUE = 50000;
    const MAX_PRIME_LIST_ITERATION_INDEX = 5133;

    var foundPrimes = generatePrimes();
    var primeSumOccurrences = new Int32Array(MAX_PRIME_SUM_VALUE + 1);

    // Calculate sums of prime pairs
    for (var outerIdx = 1; outerIdx < MAX_PRIME_LIST_ITERATION_INDEX; outerIdx++) {
        var currentPrimeVal1 = foundPrimes[outerIdx];
        for (var innerIdx = 1; innerIdx <= outerIdx; innerIdx++) {
            var currentSumOfPrimes = currentPrimeVal1 + foundPrimes[innerIdx];
            if (currentSumOfPrimes > MAX_PRIME_SUM_VALUE) {
                break;
            }
            primeSumOccurrences[currentSumOfPrimes]++;
        }
    }

    // Process input lines
    let lineCursor = 0;
    let currentInputValue;
    while (true) {
        currentInputValue = +rawInputLines[lineCursor++];
        if (!currentInputValue) {
            break;
        }
        console.log(primeSumOccurrences[currentInputValue]);
    }
}

// Helper function to generate prime numbers, renamed and modified
function generatePrimes() {
    const SIEVE_UPPER_BOUND = 49999;
    var sieveMarked = new Int8Array(SIEVE_UPPER_BOUND + 1);

    // Mark 0 and 1 as not prime
    sieveMarked[0] = 1;
    sieveMarked[1] = 1;

    var sqrtLimit = Math.floor(Math.sqrt(SIEVE_UPPER_BOUND));
    for (var numCandidate = 2; numCandidate <= sqrtLimit; numCandidate++) {
        var isMarked = sieveMarked[numCandidate];
        if (isMarked) {
            continue;
        }

        // Mark multiples of current prime as not prime
        for (var multipleOfPrime = numCandidate * 2; multipleOfPrime <= SIEVE_UPPER_BOUND; multipleOfPrime += numCandidate) {
            sieveMarked[multipleOfPrime] = 1;
        }
    }

    var collectedPrimes = new Int32Array(5134);
    var primeCountIndex = 0;

    // Collect actual prime numbers
    for (var currentNum = 1; currentNum <= SIEVE_UPPER_BOUND; currentNum++) {
        var isPrimeCandidate = !sieveMarked[currentNum];
        if (isPrimeCandidate) {
            primeCountIndex++;
            collectedPrimes[primeCountIndex] = currentNum;
        }
    }

    return collectedPrimes;
}
