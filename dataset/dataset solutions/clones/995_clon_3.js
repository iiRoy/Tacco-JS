const fileSystemOperations = require('fs');
const standardInputSource = '/dev/stdin';

let rawInputContent;
try {
  rawInputContent = fileSystemOperations.readFileSync(standardInputSource, 'utf8');
} catch (dataReadError) {
  console.error("Input processing failure:", dataReadError.message);
  process.exit(1);
}

const cleanedInputString = rawInputContent.trim();
if (!cleanedInputString) {
  console.log(0);
  process.exit(0);
}

const numericalEntryList = cleanedInputString.split('\n').map(lineSegment => {
    const numericValue = Number(lineSegment);
    return isNaN(numericValue) ? null : numericValue;
}).filter(item => item !== null);

if (numericalEntryList.length === 0) {
    console.log(0);
    process.exit(0);
}

// The first number in the input is often a count, but was unused in the original.
// We store it here, mirroring the original's effect of removing it from the list.
const initialCountValue = numericalEntryList.shift();

/**
 * Evaluates if a given integer is a prime number.
 * @param {number} testInteger - The integer to be checked.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function determineIfPrime(testInteger) {
  if (typeof testInteger !== 'number' || !Number.isInteger(testInteger) || testInteger < 0) {
    return false; // Non-integer or negative inputs are not prime.
  }

  if (testInteger < 2) {
    return false; // Numbers less than 2 are not prime.
  }
  if (testInteger === 2) {
    return true; // 2 is the only even prime number.
  }
  if (testInteger % 2 === 0) {
    return false; // All other even numbers are not prime.
  }

  const squareRootLimit = Math.sqrt(testInteger);

  for (let potentialFactor = 3; potentialFactor <= squareRootLimit; potentialFactor += 2) {
    if (testInteger % potentialFactor === 0) {
      return false; // Found a factor, so it's not prime.
    }
  }

  return true; // No factors found, it's a prime number.
}

let finalPrimeCounter = 0;

for (const currentNumericalElement of numericalEntryList) {
  const isElementPrime = determineIfPrime(currentNumericalElement);
  if (isElementPrime) {
    finalPrimeCounter += 1;
  }
}

console.log(finalPrimeCounter);