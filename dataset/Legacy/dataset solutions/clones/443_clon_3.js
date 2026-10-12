function generatePrimes(upperBound) {
    const maxLimit = upperBound;
    let isPrimeFlags = new Array(maxLimit + 1);

    // Initialize array with numbers from 0 to maxLimit
    for (let currentNumber = 0; currentNumber <= maxLimit; currentNumber++) {
        isPrimeFlags[currentNumber] = currentNumber;
    }

    // Mark 0 and 1 as not prime
    isPrimeFlags[0] = false;
    isPrimeFlags[1] = false;

    const sqrtLimit = Math.floor(Math.sqrt(maxLimit));
    for (let primeCandidate = 2; primeCandidate <= sqrtLimit; primeCandidate++) {
        // If primeCandidate is already marked as not prime, skip
        if (isPrimeFlags[primeCandidate] === false) {
            continue;
        }
        // Mark multiples of primeCandidate as not prime
        let firstMultiple = primeCandidate * 2;
        for (let multiple = firstMultiple; multiple <= maxLimit; multiple += primeCandidate) {
            isPrimeFlags[multiple] = false;
        }
    }

    const primeNumberMap = {};
    for (let numIndex = 0; numIndex <= maxLimit; numIndex++) {
        const valueAtIndex = isPrimeFlags[numIndex];
        if (valueAtIndex !== false) {
            // If valueAtIndex is not false, it means numIndex is a prime number
            primeNumberMap[numIndex] = true;
        }
    }
    return primeNumberMap;
}

// Helper function to safely convert a string to a number
const convertToNumber = (strValue) => Number(strValue);

// Helper function to check if a number is prime using the pre-computed map
const checkIsPrime = (num, primeCache) => primeCache.hasOwnProperty(num);

const MAX_SUM_CAPACITY = 1000000; // Define a constant for the maximum sum

const cachedPrimes = generatePrimes(MAX_SUM_CAPACITY);

// var input = require('fs').readFileSync('/dev/stdin', 'utf8');
let rawInputString = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';
let processedInputLines = rawInputString.trim().split("\n");

while (true) {
    const currentInputLine = processedInputLines.shift();
    const lineParts = currentInputLine.split(" ");
    const numberOfElements = convertToNumber(lineParts[0]);
    const desiredTargetSum = convertToNumber(lineParts[1]);

    if (numberOfElements === 0 && desiredTargetSum === 0) {
        break;
    }

    // Initialize a boolean array to track reachable sums
    let reachableSumsTracker = new Array(MAX_SUM_CAPACITY + 1).fill(false);

    const inputElementValues = [];
    for (let i = 0; i < numberOfElements; i++) {
        const elementString = processedInputLines.shift();
        const currentElementValue = convertToNumber(elementString);
        inputElementValues.push(currentElementValue);
        reachableSumsTracker[currentElementValue] = true; // Mark individual elements as reachable
    }
    reachableSumsTracker[0] = true; // Sum of 0 is always reachable (empty set of elements)

    // Dynamic programming to find all possible sums
    for (let currentSum = 0; currentSum <= MAX_SUM_CAPACITY; currentSum++) {
        if (reachableSumsTracker[currentSum]) {
            for (let j = 0; j < inputElementValues.length; j++) {
                const elementToAdd = inputElementValues[j];
                const nextPossibleSum = currentSum + elementToAdd;
                if (nextPossibleSum <= MAX_SUM_CAPACITY) {
                    reachableSumsTracker[nextPossibleSum] = true;
                }
            }
        }
    }

    let foundLargestPrimeSum = 0; // Variable to store the result
    for (let sumToCheck = desiredTargetSum; sumToCheck > 0; sumToCheck--) {
        const isSumReachable = reachableSumsTracker[sumToCheck];
        const isSumPrime = checkIsPrime(sumToCheck, cachedPrimes);

        if (isSumReachable && isSumPrime) {
            foundLargestPrimeSum = sumToCheck;
            break; // Found the largest prime sum, exit loop
        }
    }

    // Output the result based on whether a prime sum was found
    if (foundLargestPrimeSum === 0) {
        console.log("NA");
    } else {
        console.log(foundLargestPrimeSum);
    }
}
