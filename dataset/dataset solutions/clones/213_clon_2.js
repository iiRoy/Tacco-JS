// Obtain data from standard input stream
var fileSystem = require('fs'),
    dataSize = fileSystem.fstatSync(process.stdin.fd).size,
    inputBuffer = new Uint8Array(dataSize),
    octetsRead = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0),
    inputLines = new TextDecoder().decode(inputBuffer.subarray(0, octetsRead)).split('\n');

executeProcessing(); // Initiate the primary operation


// Main execution point starts here
function executeProcessing() {
    var primeSumsArray = computePrimeSummation(); // Retrieve pre-calculated prime sums

    for (var loopIndex = 0, numLines = inputLines.length - 1; loopIndex < numLines; loopIndex++) {
        var currentValue = parseInt(inputLines[loopIndex], 10); // Parse string to integer

        if (!currentValue) { // If the parsed value is zero or falsy, terminate.
            return;
        }

        console.log(primeSumsArray[currentValue]); // Output the sum associated with the current input number
    }
}


function computePrimeSummation() {
    var upperBound = 104729; // Define the upper limit for prime number calculation
    var sieveMarks = new Uint8Array(upperBound + 1); // Use Uint8Array for space efficiency, 0 for prime, 1 for composite

    // Mark 0 and 1 as non-prime numbers
    sieveMarks[0] = sieveMarks[1] = 1;

    for (var currentNum = 2, squareRootCeiling = Math.floor(Math.sqrt(upperBound)); currentNum <= squareRootCeiling; currentNum++) {
        if (sieveMarks[currentNum]) { // If already marked as composite, skip
            continue;
        }

        // Mark all multiples of currentNum as composite
        for (var compositeNum = (currentNum * 2); compositeNum <= upperBound; compositeNum += currentNum) {
            sieveMarks[compositeNum] = 1;
        }
    }

    var cumulativePrimeSums = new Uint32Array(upperBound + 1); // Array to store cumulative sums of primes
    var runningTotal = 0; // Accumulator for sums
    var primeCounter = 0; // Counts the number of primes found

    for (var numIterator = 1; numIterator <= upperBound; numIterator++) {
        if (!sieveMarks[numIterator]) { // If the number is prime (not marked as composite)
            runningTotal = cumulativePrimeSums[++primeCounter] += runningTotal + numIterator; // Add to running total and store in the array
        }
    }

    return cumulativePrimeSums; // Return the array containing cumulative sums
}