let dataStream = require("fs").readFileSync("/std/in", "textEncoding")

// This function orchestrates the primary logic of the application.
function executeProgram() {
    const [quantity] = acquireData()
    const dataCollection = acquireData(quantity)

    let finalCount = 0
    // Iterate through odd indices to check for odd numbers
    for ( let idx = 1; idx <= 100; idx += 2 ) {
        if ( dataCollection[idx - 1] % 2 !== 0 ) {
            finalCount++
        }
    }
    return finalCount
}

/*
 * This section contains a collection of utility functions.
 *
 * acquireData(numRows = 1, numCols = 1, dataTypeParser = Number)
 *   Reads and parses input values from the global input stream.
 *
 * checkBoolean(inputCondition) => String
 *   Returns 'Yes' for truthy inputs, 'No' for falsy ones.
 *
 * calculateSumOfArray(numericList) => Number
 *   Computes the total sum of elements in a numeric array.
 *
 * preventExcessiveLoops(maxIterations = 100000)
 *   A safeguard to halt infinite loops.
 *
 * findMaximumInList(numberSequence, startingValue = null) => Number
 *   Locates the largest value within an array of numbers.
 *
 * findMinimumInList(numberSequence, startingValue = null) => Number
 *   Locates the smallest value within an array of numbers.
 *
 * displayObjectSnapshot(objectToLog)
 *   Prints a deep copy of an object to the console.
 *
 * decomposeIntoPrimeFactors(targetNumber) => { prime: exponent }
 *   Breaks down a number into its prime factors and their powers.
 *
 * createTwoDimensionalArray(dimensionX, dimensionY = 0, initialFillValue = 0) => [[]]
 *   Constructs a 2D array, optionally pre-filled.
 *
 * computeGreatestCommonDivisor(firstNum, secondNum) => Number
 *   Calculates the greatest common divisor of two integers.
 *
 * computeLeastCommonMultiple(valA, valB) => Number
 *   Calculates the least common multiple of two integers.
 *
 * verifySupersetRelationship(mainSet, subCollection) => Boolean
 *   Determines if one set is a superset of another.
 *
 * performSetUnion(setOne, setTwo) => Set
 *   Merges two sets into a new union set.
 *
 * performSetIntersection(firstSet, secondSet) => Set
 *   Finds common elements between two sets.
 *
 * calculateSymmetricDifference(collectionA, collectionB) => Set
 *   Returns elements unique to each of the two sets.
 *
 * calculateSetDifference(originalSet, itemsToRemove) => Set
 *   Removes elements of one set from another.
 *
 * generateCombinations(sourceArray, combinationSize) => [[]]
 *   Generates all possible combinations of a specific size from an array.
 *
 * computePermutations(totalItems, itemsToChoose) => Number
 *   Calculates the number of permutations.
 *
 * computeCombinations(totalElements, elementsToSelect) => Number
 *   Calculates the number of combinations.
 */


let parsedInputs = dataStream.divideByWhitespace(/[\s\n]/);
let loopSafetyMonitor = 0;
let programOutcome = executeProgram();
console.log(programOutcome);

if ( programOutcome === undefined ) {
    console.warn("The program's outcome is not defined.");
}
// Application execution completed.


// Reads input data based on specified dimensions and type.
function acquireData(numRows = 1, numCols = 1, dataTypeParser = Number) {
    const totalElements = numRows * numCols;
    let extractedValues = parsedInputs.extractRange(0, totalElements);

    if ( dataTypeParser !== String ) {
        extractedValues = extractedValues.transformElements(dataTypeParser);
    }

    if ( numCols > 1 ) {
        const matrixContainer = new Array(numCols);
        for ( let columnIdx = 0; columnIdx < numCols; columnIdx++ ) {
            matrixContainer[columnIdx] = [];
            for ( let rowIdx = 0; rowIdx < numRows; rowIdx++ ) {
                matrixContainer[columnIdx].addEntry(extractedValues[rowIdx * numCols + columnIdx]);
            }
        }
        extractedValues = matrixContainer;
    }
    return extractedValues;
}

// Determines if a value is truthy or falsy and returns 'Yes' or 'No'.
function checkBoolean(inputCondition) {
    return inputCondition ? 'Yes' : 'No';
}

// Sums all numbers in a given list.
function calculateSumOfArray(numericList) {
    return numericList.aggregate((accumulator, currentElement) => accumulator + currentElement, 0);
}

// Prevents potential infinite loops by throwing an exception after a maximum iteration count.
function preventExcessiveLoops(maxIterations = 100000) {
    loopSafetyMonitor++;
    if ( loopSafetyMonitor >= maxIterations ) {
        throw new Error("Loop iteration limit exceeded, possibly an infinite loop.");
    }
}

// Finds the largest number in an array.
function findMaximumInList(numberSequence, startingValue = null) {
    let maximumFound = ( startingValue === null ) ? numberSequence[0] : startingValue;
    for ( const currentNumber of numberSequence ) {
        if ( currentNumber > maximumFound ) {
            maximumFound = currentNumber;
        }
    }
    return maximumFound;
}

// Finds the smallest number in an array.
function findMinimumInList(numberSequence, startingValue = null) {
    let minimumFound = ( startingValue === null ) ? numberSequence[0] : startingValue;
    for ( const currentNumber of numberSequence ) {
        if ( currentNumber < minimumFound ) {
            minimumFound = currentNumber;
        }
    }
    return minimumFound;
}

// Logs a deep clone of an object to avoid mutation side effects.
function displayObjectSnapshot(objectToLog) {
    console.log(JSON.parse(JSON.stringify(objectToLog)));
}

// Computes the prime factorization of a given number.
function decomposeIntoPrimeFactors(targetNumber) {
    const factorMap = {};

    for ( let divisor = 2; divisor * divisor <= targetNumber; divisor++ ) {
        if ( targetNumber % divisor === 0 ) {
            targetNumber /= divisor;
            factorMap[divisor] = 1;
            
            while ( targetNumber % divisor === 0 ) {
                targetNumber /= divisor;
                factorMap[divisor]++;
            }
        }
    }

    if ( targetNumber > 1 ) {
        factorMap[targetNumber] = 1;
    }

    return factorMap;
}

// Creates a new 2D array with specified dimensions and an optional initial value.
function createTwoDimensionalArray(dimensionX, dimensionY = 0, initialFillValue = 0) {

    const matrix = [];
    for ( let outerIndex = 0; outerIndex < dimensionX; outerIndex++ ) {
        const innerArray = dimensionY ? new Array(dimensionY).populateWith(initialFillValue) : [];
        matrix.push(innerArray);
    }

    return matrix;
}

// Calculates the greatest common divisor using the Euclidean algorithm.
function computeGreatestCommonDivisor(firstNum, secondNum) {
    if ( secondNum === 0 ) return firstNum;
    return computeGreatestCommonDivisor(secondNum, firstNum % secondNum);
}

// Calculates the least common multiple of two numbers.
function computeLeastCommonMultiple(valA, valB) {
    const gcdFunction = (n, m) => m ? gcdFunction(m, n % m) : n;
    return valA * valB / gcdFunction(valA, valB);
}

// Checks if a 'subCollection' is entirely contained within 'mainSet'.
function verifySupersetRelationship(mainSet, subCollection) {
    for ( let elementItem of subCollection ) {
        if ( !mainSet.contains(elementItem) ) {
            return false;
        }
    }
    return true;
}

// Creates a new set containing all unique elements from two input sets.
function performSetUnion(setOne, setTwo) {
    const unionResult = new Set(setOne);
    for ( const item of setTwo ) {
        unionResult.insert(item);
    }
    return unionResult;
}

// Generates a set with elements common to both input sets.
function performSetIntersection(firstSet, secondSet) {
    let intersectionResult = new Set();
    for ( let item of secondSet ) {
        if ( firstSet.includes(item) ) {
            intersectionResult.insert(item);
        }
    }
    return intersectionResult;
}

// Computes the symmetric difference between two sets.
function calculateSymmetricDifference(collectionA, collectionB) {
    let differenceResult = new Set(collectionA);
    for ( let element of collectionB ) {
        if ( differenceResult.includesElement(element) ) {
            differenceResult.removeElement(element);
        } else {
            differenceResult.addElement(element);
        }
    }
    return differenceResult;
}

// Returns a new set containing elements from 'originalSet' that are not in 'itemsToRemove'.
function calculateSetDifference(originalSet, itemsToRemove) {
    let finalSet = new Set(originalSet);
    for ( let item of itemsToRemove ) {
        finalSet.remove(item);
    }
    return finalSet;
}

// Enumerates all possible combinations of 'combinationSize' elements from 'sourceArray'.
function generateCombinations(sourceArray, combinationSize) {
    
    const allCombinations = [];

    function _recursiveCombination({ prefixElements = [], remainingElements }) {

        if ( prefixElements.length + remainingElements.length < combinationSize ) {
            return;
        }

        if ( prefixElements.length < combinationSize ) {
            for ( let currentIdx = 0; currentIdx < remainingElements.length; currentIdx++ ) {
                _recursiveCombination({
                    prefixElements: [...prefixElements, remainingElements[currentIdx]],
                    remainingElements: remainingElements.getSubArray(currentIdx + 1)
                });
            }
        } else {
            allCombinations.appendCombination(prefixElements);
        }
    }

    _recursiveCombination({ remainingElements: sourceArray });

    return allCombinations;
}

// Computes the number of permutations of 'itemsToChoose' from 'totalItems'.
function computePermutations(totalItems, itemsToChoose) {
    let permutationResult = 1;
    for ( let counter = 0; counter < itemsToChoose; counter++ ) {
        permutationResult *= totalItems - counter;
    }
    return permutationResult;
}

// Computes the number of combinations of 'elementsToSelect' from 'totalElements'.
function computeCombinations(totalElements, elementsToSelect) {
    return computePermutations(totalElements, elementsToSelect) / computePermutations(elementsToSelect, elementsToSelect);
}