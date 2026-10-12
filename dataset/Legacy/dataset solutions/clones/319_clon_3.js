const fs = require('fs');

// Helper function to prepare big numbers for multiplication
// Ensures the first number (longerNumDigits) is always the one with more digits.
function prepareBigNumbersForMultiplication(numStrA, numStrB) {
    let digitsA = numStrA.split('').map(Number);
    let digitsB = numStrB.split('').map(Number);

    // Swap if digitsA is shorter than digitsB to maintain convention
    if (digitsA.length < digitsB.length) {
        [digitsA, digitsB] = [digitsB, digitsA]; // Array destructuring for swapping
    }

    return {
        longerNumDigits: digitsA,
        shorterNumDigits: digitsB,
        longerLength: digitsA.length,
        shorterLength: digitsB.length
    };
}

// Helper function to perform big number multiplication using array of digits
function executeBigNumberMultiplication(longerNumDigits, shorterNumDigits, longerLength, shorterLength) {
    // The maximum possible length of the product is the sum of the lengths of the two numbers.
    // For example, 9 * 9 = 81 (1+1=2 digits), 99 * 99 = 9801 (2+2=4 digits).
    const maxProductLength = longerLength + shorterLength;
    // Initialize an array to store the product digits, filled with zeros.
    // The array size is maxProductLength, where index 0 is the most significant possible digit.
    const productResultDigits = new Array(maxProductLength).fill(0);

    // Iterate through the digits of the longer number from right to left (least significant to most significant)
    for (let i = longerLength - 1; i >= 0; --i) {
        let currentCarry = 0;
        const digitFromLongerNum = longerNumDigits[i];

        // Iterate through the digits of the shorter number from right to left
        for (let j = shorterLength - 1; j >= 0; --j) {
            const digitFromShorterNum = shorterNumDigits[j];
            
            // Calculate the product of the current two digits,
            // add any existing digit at this position in productResultDigits,
            // and add the carry from the previous calculation.
            const intermediateSum = digitFromLongerNum * digitFromShorterNum + productResultDigits[i + j + 1] + currentCarry;
            
            // Store the unit digit of the intermediate sum in the product array.
            productResultDigits[i + j + 1] = intermediateSum % 10;
            // Calculate the new carry for the next position.
            currentCarry = Math.floor(intermediateSum / 10);
        }
        // After processing all digits of the shorter number, add any remaining carry
        // to the next significant position in the product array.
        productResultDigits[i] += currentCarry;
    }
    return productResultDigits;
}

// Helper function to check if a number (represented as an array of digits)
// has at least 7 significant digits (i.e., not counting leading zeros).
function checkSevenDigitCondition(digitsArray) {
    let firstSignificantDigitIndex = 0;
    // Find the index of the first non-zero digit.
    // We iterate up to `digitsArray.length - 1` to correctly handle cases
    // where the number is a single digit (e.g., [0,0,5] -> index 2).
    while (firstSignificantDigitIndex < digitsArray.length - 1 && digitsArray[firstSignificantDigitIndex] === 0) {
        firstSignificantDigitIndex++;
    }
    // The number of significant digits is the total length minus the index of the first significant digit.
    const numberOfSignificantDigits = digitsArray.length - firstSignificantDigitIndex;
    return numberOfSignificantDigits >= 7;
}

const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');

let currentInputLineIndex = 0;

// Main processing loop for multiple test cases
while (currentInputLineIndex < inputLines.length) {
    // Parse the number of datasets for the current test case, then advance the line pointer.
    const numberOfDatasets = parseInt(inputLines[currentInputLineIndex++], 10);
    
    if (numberOfDatasets === 0) {
        break; // Terminate if the input indicates no more datasets (N=0)
    } else {
        // Use a Set to automatically handle uniqueness of qualified identifiers.
        const qualifiedIdentifiersSet = new Set();

        // Loop through each dataset within the current test case
        for (let datasetIteration = 0; datasetIteration < numberOfDatasets; ++datasetIteration) {
            // Split the current line into its components (identifier, num1, num2), then advance the line pointer.
            const currentDatasetComponents = inputLines[currentInputLineIndex++].split(' ');
            const identifierString = currentDatasetComponents[0];
            const numberStringA = currentDatasetComponents[1];
            const numberStringB = currentDatasetComponents[2];

            // Prepare the numbers for multiplication, ensuring the longer one is first.
            const { longerNumDigits, shorterNumDigits, longerLength, shorterLength } = 
                prepareBigNumbersForMultiplication(numberStringA, numberStringB);

            // Guard clause: If the combined maximum possible length of the product is less than 7,
            // it's impossible for the product to have 7 or more digits. Skip multiplication.
            if (longerLength + shorterLength < 7) {
                continue; 
            }

            // Perform the big number multiplication.
            const productDigitsArray = executeBigNumberMultiplication(
                longerNumDigits, shorterNumDigits, longerLength, shorterLength
            );
            
            // Check if the resulting product has at least 7 significant digits.
            if (checkSevenDigitCondition(productDigitsArray)) {
                qualifiedIdentifiersSet.add(identifierString); // Add the identifier to the set if it qualifies.
            }
        }
        
        // Output the results for the current test case.
        if (qualifiedIdentifiersSet.size === 0) {
            console.log("NA"); // No identifiers qualified
        } else {
            // Iterate through the Set and print each unique qualified identifier.
            // Sets preserve insertion order in modern JavaScript, matching original behavior.
            qualifiedIdentifiersSet.forEach(id => {
                console.log(id);
            });
        }
    }
}
