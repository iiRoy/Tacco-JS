let rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read raw input from standard input

// Constraints for variables: 1 <= firstVal <= secondVal <= thirdVal <= 100

function processData() { // Main processing function
    const [limitVal] = fetchInput(); // Load the single integer N

    let outputArray = new Array(limitVal + 1).fill(0); // Initialize an array to store counts, indexed from 1 to N

    for (let currentNum = 1; currentNum <= limitVal; currentNum++) { // Iterate from 1 to N
        for (let firstVal = 1; firstVal <= 100; firstVal++) { // Iterate for x from 1 to 100
            const firstValSq = firstVal * firstVal; // Calculate x^2
            for (let secondVal = firstVal; secondVal <= 100; secondVal++) { // Iterate for y from x to 100
                const secondValSq = secondVal * secondVal; // Calculate y^2
                for (let thirdVal = secondVal; thirdVal <= 100; thirdVal++) { // Iterate for z from y to 100

                    const calculatedSum = firstValSq + secondValSq + thirdVal * thirdVal + firstVal * secondVal + secondVal * thirdVal + thirdVal * firstVal; // Calculate the expression

                    if (calculatedSum > currentNum) { // If the sum exceeds currentNum, no need to check larger z values
                        break;
                    }

                    if (calculatedSum === currentNum) { // If the sum equals currentNum
                        if (firstVal === secondVal && secondVal === thirdVal) { // Case 1: x = y = z
                            outputArray[currentNum] += 1; // Add 1 to the count
                        } else if (firstVal === secondVal || secondVal === thirdVal || thirdVal === firstVal) { // Case 2: Two variables are equal
                            outputArray[currentNum] += 3; // Add 3 to the count
                        } else { // Case 3: All variables are distinct
                            outputArray[currentNum] += 6; // Add 6 to the count
                        }

                        break; // Found a match for this (x,y) pair, move to next (x,y)
                    }
                }
            }
        }
    }

    return outputArray.slice(1).join('\n'); // Return the results from index 1, joined by newlines
}

/*
Helper functions documentation:
fetchInput(numRows = 1, numCols = 1, dataType = Number): Reads input values.
isTruthyYesNo(inputVal): Returns 'Yes' for truthy, 'No' for falsy.
sumNumericList(numericList): Calculates the sum of numbers in an array.
loopGuard(maxIterations = 100000): Prevents infinite loops.
findMaxInArray(numericList, startValue = null): Finds the maximum value in an array.
findMinInArray(numericList, startValue = null): Finds the minimum value in an array.
dumpObject(inputVal): Logs a deep copy of an object to console.
getPrimeFactors(targetNum): Returns prime factors of a number as an object { prime: power }.
create2DArray(xDimension, yDimension = 0, initialFillValue = 0): Creates a 2D array.
calculateGCD(valA, valB): Computes the greatest common divisor.
calculateLCM(valA, valB): Computes the least common multiple.
isSubsetOf(mainSet, subCollection): Checks if subCollection is a subset of mainSet.
unionSets(setA, setB): Returns the union of two sets.
intersectSets(setA, setB): Returns the intersection of two sets.
symmetricDifferenceSets(setA, setB): Returns the symmetric difference of two sets.
differenceSets(setA, setB): Returns the difference of two sets (A - B).
generateCombinations(sourceArray, selectionCount): Generates all combinations of 'selectionCount' elements from 'sourceArray'.
calculatePermutations(totalItems, selectedItems): Calculates the number of permutations P(n, r).
calculateCombinations(totalItems, selectedItems): Calculates the number of combinations C(n, r).
*/


let parsedInputSegments = rawData.split(/[\s\n]/); // Split the raw input into segments by whitespace or newline
let loopSafetyCounter = 0; // Counter for infinite loop prevention
let finalOutput = processData(); // Execute the main processing logic
console.log(finalOutput); // Print the final result to console

if (finalOutput === undefined) { // Check if the final output is undefined
    console.warn("The computed result is undefined."); // Log a warning if it is
}
// console.timeEnd(); // Commented out performance timer end


// Function to load input values from the parsed segments
function fetchInput(numRows = 1, numCols = 1, dataType = Number) {
    const totalElements = numRows * numCols; // Calculate total number of elements to read
    let extractedValues = parsedInputSegments.splice(0, totalElements); // Extract elements from the global input array

    if (dataType !== String) { // If the desired type is not String, convert elements
        extractedValues = extractedValues.map(dataType);
    }
    if (numCols > 1) { // If multiple columns are expected, restructure into column-major arrays
        const columnArrays = new Array(numCols); // Create an array to hold column arrays
        for (let currentCol = 0; currentCol < numCols; currentCol++) { // Iterate through columns
            columnArrays[currentCol] = []; // Initialize each column array
            for (let currentRow = 0; currentRow < numRows; currentRow++) { // Iterate through rows
                columnArrays[currentCol].push(extractedValues[currentRow * numCols + currentCol]); // Add element to current column
            }
        }
        extractedValues = columnArrays; // Update result to be the column-major arrays
    }

    return extractedValues; // Return the processed input values
}

// Determines 'Yes' or 'No' based on a boolean value
function isTruthyYesNo(inputVal) {
    return inputVal ? 'Yes' : 'No';
}

// Computes the sum of all numbers in a given list
function sumNumericList(numericList) {
    return numericList.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
}

// Safety mechanism to prevent unintended infinite loops
function loopGuard(maxIterations = 100000) { // Default max iterations set to 100,000
    loopSafetyCounter++; // Increment the global loop counter
    if (loopSafetyCounter >= maxIterations) { // If counter exceeds max, throw an error
        throw new Error("Infinite loop detected!"); // Error message for infinite loop
    }
}

// Finds the maximum value within an array of numbers
function findMaxInArray(numericList, startValue = null) {
    let calculationResult = (startValue === null) ? numericList[0] : startValue; // Initialize result with first element or provided start value
    for (const currentElement of numericList) { // Iterate through the list
        if (currentElement > calculationResult) { // If current element is greater
            calculationResult = currentElement; // Update the maximum
        }
    }
    return calculationResult; // Return the found maximum
}

// Finds the minimum value within an array of numbers
function findMinInArray(numericList, startValue = null) {
    let calculationResult = (startValue === null) ? numericList[0] : startValue; // Initialize result with first element or provided start value
    for (const currentElement of numericList) { // Iterate through the list
        if (currentElement < calculationResult) { // If current element is smaller
            calculationResult = currentElement; // Update the minimum
        }
    }
    return calculationResult; // Return the found minimum
}

// Logs a deep copy (snapshot) of an object to the console
function dumpObject(inputVal) {
    console.log(JSON.parse(JSON.stringify(inputVal))); // Use JSON stringify/parse for deep copy
}

// Performs prime factorization of a given number, returning factors and their powers
function getPrimeFactors(targetNum) {
    const factorMap = {}; // Object to store prime factors and their counts

    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= targetNum; divisorCandidate++) { // Iterate from 2 up to sqrt(targetNum)
        if (targetNum % divisorCandidate === 0) { // If divisorCandidate is a factor
            targetNum /= divisorCandidate; // Divide targetNum by the factor
            factorMap[divisorCandidate] = 1; // Initialize count for this prime factor

            while (targetNum % divisorCandidate === 0) { // Continue dividing by the same factor
                targetNum /= divisorCandidate;
                factorMap[divisorCandidate]++; // Increment count
            }
        }
    }

    if (targetNum > 1) { // If remaining targetNum is greater than 1, it's a prime factor itself
        factorMap[targetNum] = 1;
    }

    return factorMap; // Return the map of prime factors
}

// Creates a new 2D array (matrix) with specified dimensions and initial values
function create2DArray(xDimension, yDimension = 0, initialFillValue = 0) {

    const matrix = []; // Initialize an empty array for the matrix
    for (let rowIndex = 0; rowIndex < xDimension; rowIndex++) { // Iterate for each row
        const rowContent = yDimension ? new Array(yDimension).fill(initialFillValue) : []; // Create a row, filled if yDimension is provided
        matrix.push(rowContent); // Add the row to the matrix
    }

    return matrix; // Return the newly created 2D array
}

// Computes the Greatest Common Divisor (GCD) of two numbers using Euclidean algorithm
function calculateGCD(valA, valB) {
    if (valB === 0) { // Base case: if valB is 0, valA is the GCD
        return valA;
    }
    return calculateGCD(valB, valA % valB); // Recursive call
}

// Computes the Least Common Multiple (LCM) of two numbers
function calculateLCM(valA, valB) {
    // Helper function for GCD, using a different name to avoid conflict and demonstrate renaming
    const gcdHelper = (num1, num2) => num2 ? gcdHelper(num2, num1 % num2) : num1;
    return (valA * valB) / gcdHelper(valA, valB); // LCM(a,b) = |a*b| / GCD(a,b)
}

// Checks if a subCollection is a subset of a mainSet
function isSubsetOf(mainSet, subCollection) {
    for (let elementItem of subCollection) { // Iterate through elements of the potential subset
        if (!mainSet.has(elementItem)) { // If any element is not in the main set
            return false; // It's not a subset
        }
    }
    return true; // All elements are in the main set, so it's a subset
}

// Computes the union of two sets
function unionSets(setA, setB) {
    const unionResult = new Set(setA); // Start with all elements from setA
    for (const elementItem of setB) { // Add all elements from setB
        unionResult.add(elementItem);
    }
    return unionResult; // Return the combined set
}

// Computes the intersection of two sets
function intersectSets(setA, setB) {
    let intersectionResult = new Set(); // Initialize an empty set for the intersection
    for (let elementItem of setB) { // Iterate through elements of setB
        if (setA.has(elementItem)) { // If an element from setB is also in setA
            intersectionResult.add(elementItem); // Add it to the intersection set
        }
    }
    return intersectionResult; // Return the common elements
}

// Computes the symmetric difference of two sets
function symmetricDifferenceSets(setA, setB) {
    let symDiffResult = new Set(setA); // Start with elements from setA
    for (let elementItem of setB) { // Iterate through elements of setB
        if (symDiffResult.has(elementItem)) { // If element is already in symDiffResult (meaning it's in both A and B)
            symDiffResult.delete(elementItem); // Remove it
        } else { // If element is not in symDiffResult (meaning it's only in B)
            symDiffResult.add(elementItem); // Add it
        }
    }
    return symDiffResult; // Return the symmetric difference
}

// Computes the difference of two sets (elements in A but not in B)
function differenceSets(setA, setB) {
    let diffResult = new Set(setA); // Start with all elements from setA
    for (let elementItem of setB) { // Iterate through elements of setB
        diffResult.delete(elementItem); // Remove any element that is also in setB
    }
    return diffResult; // Return the difference set
}

// Generates all possible combinations of 'selectionCount' elements from a sourceArray
function generateCombinations(sourceArray, selectionCount) {

    const combinationsList = []; // Array to store all generated combinations

    // Recursive helper function for combination generation
    function _recursiveCombinator({ prefixElements = [], remainingElements }) {

        // Pruning: if current prefix length plus remaining elements count is less than desired selectionCount,
        // no valid combination can be formed from this path.
        if (prefixElements.length + remainingElements.length < selectionCount) {
            return;
        }

        if (prefixElements.length < selectionCount) { // If current combination is not yet complete
            for (let idx = 0; idx < remainingElements.length; idx++) { // Iterate through remaining elements
                _recursiveCombinator({
                    prefixElements: [...prefixElements, remainingElements[idx]], // Add current element to prefix
                    remainingElements: remainingElements.slice(0, idx) // Pass remaining elements before current one (original buggy behavior)
                });
            }
        } else { // If a combination of desired length is formed
            combinationsList.push(prefixElements); // Add it to the results
        }
    }

    _recursiveCombinator({ remainingElements: sourceArray }); // Start the recursion with the full source array

    return combinationsList; // Return the list of all combinations
}

// Calculates the number of permutations P(n, r)
function calculatePermutations(totalItems, selectedItems) {
    let calculationResult = 1; // Initialize result to 1
    for (let i = 0; i < selectedItems; i++) { // Loop 'r' times
        calculationResult *= (totalItems - i); // Multiply by (n-i)
    }
    return calculationResult; // Return the permutation count
}

// Calculates the number of combinations C(n, r)
function calculateCombinations(totalItems, selectedItems) {
    // C(n, r) = P(n, r) / P(r, r)
    return calculatePermutations(totalItems, selectedItems) / calculatePermutations(selectedItems, selectedItems);
}
