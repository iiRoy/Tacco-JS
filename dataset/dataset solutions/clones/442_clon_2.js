let   /* Function to identify prime numbers up to a given maximum value */
findPrimesUpTo = function (upperLimit)
{
    // Initialize a boolean array; true means potentially prime, false means composite
    let     sieveMarks = [];
    let     currentNumber;
    for (currentNumber = 0; currentNumber <= upperLimit; currentNumber++) {
        sieveMarks[currentNumber] = true;
    }
    sieveMarks[0] = false; // Zero is not a prime number
    sieveMarks[1] = false; // One is not a prime number

    /* Calculate the square root of the upper limit for optimization */
    const   sqrtLimit = Math.trunc(Math.pow(upperLimit, 0.5));

    /* Iterate from 2 up to the square root of the limit */
    for (currentNumber = 2; currentNumber <= sqrtLimit; currentNumber++)
    {
        /* If currentNumber is already marked as composite, skip it */
        if (sieveMarks[currentNumber] === false) {
            continue;
        }

        /* Mark all multiples of the current prime as composite */
        let     multipleIndex;
        for (multipleIndex = currentNumber + currentNumber; multipleIndex <= upperLimit; multipleIndex += currentNumber) {
            sieveMarks[multipleIndex] = false;
        }
    }

    // Store the found prime numbers in an object for quick lookup
    const   primeLookupTable = {};
    for (currentNumber = 0; currentNumber <= upperLimit; currentNumber++) {
        if (sieveMarks[currentNumber] !== false) {
            primeLookupTable[sieveMarks[currentNumber]] = true;
        }
    }
    return primeLookupTable;
};

/* Pre-calculate primes up to a million for efficient lookups later */
const   allPrimes = findPrimesUpTo(1000000);

/* Read input data from standard input */
const   fileContents = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
let     dataLines = fileContents.trim().split('\n');

/* Process input lines until a termination condition is met */
for (;;)
{
    // Extract N and X from the current line
    const   linePair = dataLines.shift().split(' ').map(Number);
    const   valueN = linePair[0];
    const   valueX = linePair[1];

    /* Terminate if N and X are both zero */
    if (valueN === 0 && valueX === 0) {
        break;
    }

    // Initialize a dynamic programming array to track reachable sums
    let     possibleSums = [];
    let     idx;
    for (idx = 0; idx <= 1000000; idx++) {
        possibleSums[idx] = false;
    }

    // Store the input numbers and mark them as initially reachable sums
    const   inputNumbers = [];
    let     numCount;
    for (numCount = 0; numCount < valueN; numCount++) {
        const   currentNumber = dataLines.shift() | 0; // Convert to number
        inputNumbers.push(currentNumber);
        possibleSums[currentNumber] = true;
    }
    possibleSums[0] = true; // Zero sum is always reachable (by picking no numbers)

    /* Calculate all possible sums using the input numbers */
    let     currentSum;
    for (currentSum = 0; currentSum <= 1000000; currentSum++)
    {
        let     numberIdx;
        for (numberIdx = 0; numberIdx < inputNumbers.length; numberIdx++)
        {
            // Avoid exceeding the maximum sum limit
            if (currentSum + inputNumbers[numberIdx] > 1000000) {
                continue;
            }
            // If currentSum is reachable, then currentSum + inputNumbers[numberIdx] is also reachable
            if (possibleSums[currentSum]) {
                possibleSums[currentSum + inputNumbers[numberIdx]] = true;
            }
        }
    }

    /* Find the largest reachable sum (less than or equal to X) that is also a prime number */
    let     resultValue;
    for (resultValue = valueX; resultValue > 0; resultValue--)
    {
        // Check if the sum is reachable AND if it's a prime number
        if (possibleSums[resultValue] && Object.prototype.hasOwnProperty.call(allPrimes, resultValue)) {
            break;
        }
    }

    // Output the result
    console.log((resultValue === 0) ? 'NA' : resultValue);
}