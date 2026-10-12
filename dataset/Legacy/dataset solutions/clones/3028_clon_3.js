"use strict";

// InputReader class for parsing input strings from a multi-line source
class InputReader {
  constructor(sourceString, parseFunction) {
    this._sourceLines = sourceString.split("\n");
    this._currentColumn = 0;
    this._currentLine = 0;
    this._valueParser = parseFunction || Number; // Function to parse individual values
  }

  // Reads the next single value from the input stream
  readNextValue() {
    const currentLineContent = this._sourceLines[this._currentLine];
    if (currentLineContent === undefined) { // If no more lines, return undefined
      return undefined;
    }

    // Split the current line into tokens, handling whitespace
    const tokens = currentLineContent.trim().split(" ");
    const valueToParse = tokens[this._currentColumn];
    this._currentColumn++;

    // If all tokens on the current line have been read, advance to the next line
    if (this._currentColumn >= tokens.length) {
      this._currentColumn = 0;
      this._currentLine++;
    }
    return this._valueParser(valueToParse);
  }

  // Reads all values from the current line and advances to the next line
  readLineValues() {
    const currentLineContent = this._sourceLines[this._currentLine];
    if (currentLineContent === undefined) { // If no more lines, return undefined
      return undefined;
    }
    this._currentColumn = 0; // Reset column as we're reading a whole new line
    this._currentLine++;
    return currentLineContent.split(" ").map(this._valueParser);
  }
}

// Function to generate prime numbers up to a given limit using the Sieve of Eratosthenes
function generatePrimesUpTo(upperLimit) {
  const isPrimeFlags = new Array(upperLimit + 1).fill(true);
  isPrimeFlags[0] = false; // 0 is not prime
  isPrimeFlags[1] = false; // 1 is not prime

  const foundPrimes = [];
  for (let currentNum = 2; currentNum <= upperLimit; currentNum++) {
    if (isPrimeFlags[currentNum]) {
      foundPrimes.push(currentNum);
      // Mark multiples of currentNum as not prime, starting from currentNum * currentNum
      for (let multiple = currentNum * currentNum; multiple <= upperLimit; multiple += currentNum) {
        isPrimeFlags[multiple] = false;
      }
    }
  }
  return foundPrimes;
}

// Recursive function to calculate the greatest common divisor (GCD) of two numbers
function calculateGCD(numA, numB) {
  if (numB === 0) {
    return numA;
  }
  return calculateGCD(numB, numA % numB);
}

// Global constant for the maximum prime sieve limit
const MAX_PRIME_SIEVE_LIMIT = 100000;
const PRECOMPUTED_PRIMES = generatePrimesUpTo(MAX_PRIME_SIEVE_LIMIT);

// Helper function to find primes that satisfy specific array conditions
function findPrimesMeetingArrayConditions(arrayLength, dataArray, primesToCheck) {
  const qualifyingPrimes = [];
  for (const candidatePrime of primesToCheck) {
    // Guard clause: if the first element is not divisible by candidatePrime, skip this prime
    if (dataArray[0] % candidatePrime !== 0) {
      continue;
    }

    let allConditionsMetForPrime = true;
    // Check the sum condition for each 'i' from 1 up to (candidatePrime - 1)
    for (let i = 1; i < candidatePrime; i++) {
      let currentSumIndex = i;
      let accumulatedSum = 0;
      // Sum elements at specific indices: i, i + (prime-1), i + 2*(prime-1), etc.
      while (currentSumIndex <= arrayLength) {
        accumulatedSum += dataArray[currentSumIndex];
        currentSumIndex += candidatePrime - 1; // Specific pattern from original logic
      }
      // If the accumulated sum is not divisible, this prime fails the condition
      if (accumulatedSum % candidatePrime !== 0) {
        allConditionsMetForPrime = false;
        break; // Exit inner loop for 'i'
      }
    }

    if (allConditionsMetForPrime) {
      qualifyingPrimes.push(candidatePrime);
    }
  }
  return qualifyingPrimes;
}

// Helper function to extract unique prime factors from a given number
function extractPrimeFactors(numberToFactor, primeList) {
  const factors = new Set(); // Use a Set to store unique factors
  let tempNumber = numberToFactor;
  let primeListIndex = 0;

  while (tempNumber > 1 && primeListIndex < primeList.length) {
    const currentPrimeDivisor = primeList[primeListIndex];
    if (tempNumber % currentPrimeDivisor === 0) {
      factors.add(currentPrimeDivisor); // Add to set to ensure uniqueness
      while (tempNumber % currentPrimeDivisor === 0) {
        tempNumber /= currentPrimeDivisor;
      }
    }
    primeListIndex++;
  }

  if (tempNumber > 1) { // If tempNumber is still > 1, it's a prime factor itself
    factors.add(tempNumber);
  }
  return Array.from(factors); // Convert Set back to Array
}

// Helper function to print unique numbers from a sorted array
function printUniqueSortedNumbers(numbersArray) {
  numbersArray.sort((a, b) => a - b); // Ensure sorted order

  let lastPrintedValue = null; // Initialize to a value guaranteed not to be in the array
  for (const num of numbersArray) { // Using for...of for cleaner iteration
    if (num !== lastPrintedValue) {
      console.log(num);
      lastPrintedValue = num;
    }
  }
}

// Main function to process the input and produce the required output
function main(inputString) {
  const inputProcessor = new InputReader(inputString);

  const arrayLength = inputProcessor.readNextValue();
  const rawInputArray = [];

  // Read N+1 elements into the array
  for (let i = 0; i <= arrayLength; i++) {
    rawInputArray.push(inputProcessor.readNextValue());
  }

  // Reverse the array in place as per original logic
  rawInputArray.reverse();

  // Calculate the GCD of all elements in the array
  let overallGCD = rawInputArray[0];
  for (let i = 1; i <= arrayLength; i++) {
    overallGCD = Math.abs(calculateGCD(overallGCD, rawInputArray[i]));
  }

  // Create a new array with elements normalized by the overall GCD
  const normalizedArray = rawInputArray.map(val => val / overallGCD);

  // Filter the precomputed primes to only those relevant to the array length
  const relevantPrimesForConditions = PRECOMPUTED_PRIMES.filter(p => p <= arrayLength);

  // Find primes that satisfy the specific array conditions
  const conditionPrimes = findPrimesMeetingArrayConditions(arrayLength, normalizedArray, relevantPrimesForConditions);

  // Extract prime factors from the calculated overall GCD
  const gcdFactors = extractPrimeFactors(overallGCD, PRECOMPUTED_PRIMES);

  // Combine all found primes and remove duplicates using a Set
  const finalResultPrimes = [...new Set([...conditionPrimes, ...gcdFactors])];

  // Print the unique sorted primes to console
  printUniqueSortedNumbers(finalResultPrimes);
}

// Entry point: Read input from stdin and call the main processing function
main(require("fs").readFileSync("/dev/stdin", "utf8"));
