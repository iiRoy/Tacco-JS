let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input string into an array of lines
let dataRows = rawData.split('\n');

// Extract the first line, split it by space, and parse the numbers
let currentLine = dataRows.shift().split(' ');

// Convert the first string part to a number
let firstNum = currentLine[0] * 1;

// Convert the second string part to a number
let secondNum = currentLine[1] * 1;

/**
 * Computes all positive divisors of a given integer.
 * @param {number} numberVal - The integer for which to find divisors.
 * @returns {number[]} An array of divisors sorted in ascending order.
 */
const calculateDivisors = function(numberVal) {
    let divisorList = []; // Initialize an empty array to store the divisors
    // Iterate from 1 up to the square root of the number
    for (let idx = 1; idx * idx <= numberVal; idx++) {
        // If 'idx' divides 'numberVal' evenly
        if (numberVal % idx === 0) {
            divisorList.push(idx); // Add 'idx' to the list of divisors
            // If 'idx' is not the square root, its pair (numberVal / idx) is also a divisor
            if (idx !== numberVal / idx) {
                divisorList.push(numberVal / idx);
            }
        }
    }
    // Sort the collected divisors in numerical ascending order
    return divisorList.sort((valA, valB) => valA - valB);
};

/**
 * Checks if a given number is a prime number.
 * @param {number} valToCheck - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
const checkIfPrime = function(valToCheck) {
    // Numbers less than 2 are not considered prime
    if (valToCheck < 2) {
        return false;
    }
    // Iterate from 2 up to the square root of the number
    for (let counter = 2; counter * counter <= valToCheck; counter++) {
        // If the number is divisible by 'counter', it's not prime
        if (valToCheck % counter === 0) {
            return false;
        }
    }
    // If no divisors were found, the number is prime
    return true;
};

/**
 * Computes the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 * Note: This function is defined but not utilized in the main logic of this script.
 * @param {number} num1 - The first number.
 * @param {number} num2 - The second number.
 * @param {number} tempVar - A temporary variable used in the calculation.
 * @returns {number} The greatest common divisor of num1 and num2.
 */
const findGreatestCommonDivisor = function(num1, num2, tempVar) {
	while (num1 % num2 !== 0) {
		tempVar = num2;
		num2 = num1 % num2;
		num1 = tempVar;
	}
	return num2;
};

// Obtain the sorted list of divisors for the first input number
let firstNumDivisors = calculateDivisors(firstNum);

// Obtain the sorted list of divisors for the second input number
let secondNumDivisors = calculateDivisors(secondNum);

// Initialize an array to store common divisors found
let commonDivisors = [];

// Get the largest divisor from the first number's list
let currentADivisor = firstNumDivisors.pop();

// Get the largest divisor from the second number's list
let currentBDivisor = secondNumDivisors.pop();

// Loop until both current divisors are 1 (meaning all larger divisors have been processed)
while (currentADivisor !== 1 || currentBDivisor !== 1) {
    // If the current divisors from both lists are equal, they are a common divisor
    if (currentADivisor === currentBDivisor) {
        commonDivisors.push(currentADivisor); // Add to the common divisors list
        currentADivisor = firstNumDivisors.pop(); // Move to the next largest divisor for 'a'
        currentBDivisor = secondNumDivisors.pop(); // Move to the next largest divisor for 'b'
    } else {
        // If the divisors are not equal, discard the larger one and get the next from its list
        if (currentADivisor < currentBDivisor) {
            currentBDivisor = secondNumDivisors.pop(); // 'b's divisor is larger, so pop it
        } else {
            currentADivisor = firstNumDivisors.pop(); // 'a's divisor is larger, so pop it
        }
    }
}

// Initialize a counter for prime common divisors, starting at 1 (for the number 1 itself)
let primeCount = 1;

// Iterate through the array of common divisors
for (let loopIndex = 0; loopIndex < commonDivisors.length; loopIndex++) {
    // Check if the current common divisor is a prime number
    if (checkIfPrime(commonDivisors[loopIndex])) {
        primeCount++; // Increment the count if it is prime
    }
}

// Output the final count of prime common divisors
console.log(primeCount);
