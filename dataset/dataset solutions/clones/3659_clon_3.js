function determinePrimality(testSubject) {
    // Type III: Guard clauses for non-positive and small numbers
    if (testSubject <= 1) {
        return false; // Numbers less than or equal to 1 are not considered prime
    }
    if (testSubject === 2 || testSubject === 3) {
        return true; // 2 and 3 are prime numbers
    }
    // Type III: Initial optimization - check for divisibility by 2 and 3
    // All primes greater than 3 can be expressed in the form 6k ± 1
    if (testSubject % 2 === 0 || testSubject % 3 === 0) {
        return false; // If divisible by 2 or 3 (and not 2 or 3 itself), it's not prime
    }

    // Type III: Optimized loop for checking divisors
    // We only need to check up to the square root of the testSubject
    // Increment by 6 to efficiently check numbers of the form 6k ± 1
    for (let currentDivisor = 5; currentDivisor * currentDivisor <= testSubject; currentDivisor += 6) {
        // Check for divisibility by currentDivisor (6k - 1) and (currentDivisor + 2) (6k + 1)
        if (testSubject % currentDivisor === 0 || testSubject % (currentDivisor + 2) === 0) {
            return false; // Found a divisor, so the number is not prime
        }
    }
    return true; // If no divisors were found, the number is prime
}

// Type III: Helper function to encapsulate input reading and parsing
function retrieveAndParseNumericInput(sourcePath) {
    // Type II: Renamed module import
    const fileSystemModule = require('fs');
    try {
        const rawFileContent = fileSystemModule.readFileSync(sourcePath, 'utf8');
        const contentLines = rawFileContent.split("\n");

        // Type III: Input validation and error handling
        if (contentLines.length < 2 || !contentLines[1]) {
            // console.error("Input error: Expected at least two lines of input, with numbers on the second line.");
            return []; // Return an empty array if input is malformed
        }
        
        // Type II: Renamed variable and used more robust parsing
        const dataStringFromSecondLine = contentLines[1].trim();

        // Type III: Check for empty data line
        if (dataStringFromSecondLine.length === 0) {
            return [];
        }

        // Type II: Used map with parseInt and radix for parsing, added trim
        return dataStringFromSecondLine.split(" ").map(str => parseInt(str.trim(), 10));
    } catch (readError) {
        // console.error(`Error reading or processing input file: ${readError.message}`);
        return []; // Return empty array on file read error
    }
}

// Type II: Renamed input source variable
const standardInputPath = '/dev/stdin';
const parsedNumericValues = retrieveAndParseNumericInput(standardInputPath);

// Type II: Renamed array for collected primes
const primeNumbersFound = [];

// Type III: Iteration using for...of loop for clarity, and added validation
for (const numericalValue of parsedNumericValues) {
    // Type III: Ensure the value is a valid number and positive before checking primality
    if (!isNaN(numericalValue) && numericalValue > 0) {
        if (determinePrimality(numericalValue)) {
            primeNumbersFound.push(numericalValue);
        }
    }
}

// Type III: Guard clause for when no prime numbers are found
if (primeNumbersFound.length === 0) {
    console.log(0); // If no primes are found, the max remainder sum is 0
} else {
    // Type II: Renamed variables for main calculation
    let currentHighestRemainderSum = 0;
    let currentMultiplierCandidate = 0; // Renamed from 'i'
    let hasCommonMultipleBeenAchieved = false; // Type III: Explicit flag for loop termination

    // Type III: Added a safety limit to prevent infinite loops in unexpected scenarios
    const MAXIMUM_ITERATIONS_ALLOWED = 1000000;

    // Type III: Changed to a while loop with explicit conditions for termination
    // The loop continues until a number is found that is a multiple of all identified primes,
    // or until the iteration limit is reached.
    while (!hasCommonMultipleBeenAchieved && currentMultiplierCandidate < MAXIMUM_ITERATIONS_ALLOWED) {
        currentMultiplierCandidate++; // Increment the number being tested
        let calculatedRemainderTotal = 0; // Type II: Renamed 'current'
        let allRemaindersAreZero = true; // Type III: Helper flag to track common multiple status

        // Type III: Iteration using for...of loop
        for (const individualPrimeFactor of primeNumbersFound) {
            const calculatedRemainder = currentMultiplierCandidate % individualPrimeFactor;
            calculatedRemainderTotal += calculatedRemainder;
            if (calculatedRemainder !== 0) {
                allRemaindersAreZero = false; // If any remainder is not zero, it's not a common multiple
            }
        }

        // Type III: Conditional logic to update max sum or terminate loop
        if (allRemaindersAreZero) {
            hasCommonMultipleBeenAchieved = true; // A common multiple (LCM) has been found, terminate loop
        } else {
            // Update the highest remainder sum if the current total is greater
            if (calculatedRemainderTotal > currentHighestRemainderSum) {
                currentHighestRemainderSum = calculatedRemainderTotal;
            }
        }
    }

    // Type III: Optional warning if the loop terminated due to iteration limit
    // if (!hasCommonMultipleBeenAchieved) {
    //     console.warn("Warning: Loop reached maximum iteration limit without finding a common multiple where all remainders are zero.");
    // }

    // Type II: Output the final result
    console.log(currentHighestRemainderSum);
}