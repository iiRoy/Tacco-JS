"use strict";

// Type III: Refactor input reading into a factory function to encapsulate state
const createInputReaderFactory = () => {
    // Helper function to load raw input data from stdin
    const loadRawInputData = () => {
        const fileSystemModule = require("fs"); // Use a temporary variable for 'fs'
        return fileSystemModule.readFileSync("/dev/stdin", "utf8").trim().split("\n");
    };

    const rawDataLines = loadRawInputData();
    let currentLinePointer = 0; // Renamed 'index' to 'currentLinePointer'
    const totalLinesCount = rawDataLines.length; // Renamed 'max' to 'totalLinesCount'

    // Return an object with methods for accessing input lines
    return {
        // Methods to interact with the input data
        hasMoreLines: function() {
            return currentLinePointer < totalLinesCount;
        },

        getNextLine: function() {
            if (!this.hasMoreLines()) {
                // Preserve exact error behavior: throw a string
                throw "ArrayIndexOutOfBoundsException";
            }
            return rawDataLines[currentLinePointer++];
        }
    };
};

// Instantiate the input reader using the factory
const inputReaderInstance = createInputReaderFactory(); // Renamed 'o' to 'inputReaderInstance'

// Type III: Introduce a small helper function for parsing integers with explicit radix
const parseStringToInt = (inputString) => parseInt(inputString, 10);

// Global helper functions for convenient input access, using the reader instance
const readNextLine = () => inputReaderInstance.getNextLine();
const readNextInteger = () => parseStringToInt(inputReaderInstance.getNextLine()); // Renamed 'nextInt'
const readNextStringArray = () => inputReaderInstance.getNextLine().split(" "); // Renamed 'nextStrArray'
const readNextIntegerArray = () => inputReaderInstance.getNextLine().split(" ").map(parseStringToInt); // Renamed 'nextIntArray'
const readNextCharacterArray = () => inputReaderInstance.getNextLine().split(""); // Renamed 'nextCharArray'
const checkAvailabilityOfNextLine = () => inputReaderInstance.hasMoreLines(); // Renamed 'hasNext'
const outputToConsole = (...outputArgs) => console.log(...outputArgs); // Renamed 'myout'

// Type III: Extract the Sieve of Eratosthenes logic into a dedicated function
const generatePrimesSieve = (limitValue) => { // Renamed 'max' to 'limitValue'
    const isPrimeFlags = new Array(limitValue).fill(true); // Renamed 'p' to 'isPrimeFlags'

    // Explicitly mark 0 and 1 as not prime
    if (limitValue > 0) isPrimeFlags[0] = false;
    if (limitValue > 1) isPrimeFlags[1] = false;

    // Mark all even numbers greater than 2 as not prime
    for (let currentNumber = 4; currentNumber < limitValue; currentNumber += 2) { // Renamed 'i' to 'currentNumber'
        isPrimeFlags[currentNumber] = false;
    }

    // Main Sieve loop for odd numbers
    // Iterate through potential prime factors starting from 3
    for (let primeCandidate = 3; primeCandidate < limitValue; primeCandidate += 2) { // Renamed 'i' to 'primeCandidate'
        // If the current number is already marked as not prime, skip it
        if (isPrimeFlags[primeCandidate] === false) { // Explicit comparison for clarity
            continue;
        }

        // If primeCandidate is prime, mark all its multiples as not prime
        // Start marking from primeCandidate * 2
        for (let multipleValue = primeCandidate * 2; multipleValue < limitValue; multipleValue += primeCandidate) { // Renamed 'j' to 'multipleValue'
            isPrimeFlags[multipleValue] = false;
        }
    }
    return isPrimeFlags;
};

const executePrimeSearch = () => { // Renamed 'Main' to 'executePrimeSearch'
    const searchStartValue = readNextInteger(); // Renamed 'X' to 'searchStartValue'
    const sieveUpperLimit = 1000000; // Renamed 'max' to 'sieveUpperLimit'

    // Generate the prime flags array using the extracted sieve function
    const primeStatusArray = generatePrimesSieve(sieveUpperLimit); // Renamed 'p' to 'primeStatusArray'

    // Search for the first prime number greater than or equal to searchStartValue
    let foundPrimeResult = -1; // Introduce a helper variable for the result
    for (let currentCheck = searchStartValue; currentCheck < sieveUpperLimit; currentCheck++) { // Renamed 'i' to 'currentCheck'
        if (primeStatusArray[currentCheck] === true) { // Explicit comparison for clarity
            foundPrimeResult = currentCheck;
            break; // Found the first prime, exit the loop
        }
    }

    // Output the found prime number
    outputToConsole(foundPrimeResult);
};

// Execute the main prime search logic
executePrimeSearch();
