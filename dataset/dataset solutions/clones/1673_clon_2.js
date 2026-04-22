let dataSource = require("node:fs").readFileSync("/dev/stdin", "utf-8"); // Obtain raw input from standard input stream

// Constraints: alpha, beta, gamma are within [1, 100], ordered ascendingly.
// 1 <= alpha <= beta <= gamma <= 100

function performCalculation() {
  const [limitVal] = acquireData(); // Get the single input value N

  let tallyArray = new Array(limitVal + 1).fill(0.0); // Initialize an array to store counts, using floating-point zeros

  for (let currentIter = 1; currentIter <= limitVal; currentIter++) {
    for (let alpha = 1; alpha <= 100; alpha++) {
      const alphaSquared = alpha * alpha; // Pre-calculate alpha squared
      for (let beta = alpha; beta <= 100; beta++) {
        const betaSquared = beta * beta; // Pre-calculate beta squared
        for (let gamma = beta; gamma <= 100; gamma++) {
          const sumComponent =
            alphaSquared +
            betaSquared +
            gamma * gamma +
            alpha * beta +
            beta * gamma +
            gamma * alpha; // Calculate the complex sum

          if (sumComponent > currentIter) {
            // If the sum exceeds the current iteration number,
            // further increments of gamma will also exceed it, so break.
            break;
          }

          if (sumComponent === currentIter) {
            // Check for strict equality
            if (alpha === beta && beta === gamma) {
              // All three variables are identical
              tallyArray[currentIter] += 1;
            } else if (alpha === beta || beta === gamma || gamma === alpha) {
              // Exactly two variables are identical
              tallyArray[currentIter] += 3;
            } else {
              // All three variables are distinct
              tallyArray[currentIter] += 6;
            }

            // Once a match is found for a given (alpha, beta, gamma),
            // subsequent increments of gamma will change sumComponent,
            // so we can break this inner loop.
            break;
          }
        }
      }
    }
  }

  // Return the results, excluding the first element (index 0), joined by carriage return and newline.
  return tallyArray.slice(1).join("\r\n");
}

/*

Reads and parses input values.
acquireData(numRows = 1, numCols = 1, valueType = Number)

Provides 'Affirmative' for truthy, 'Negative' for falsy.
affirmativeNegative(boolean) => String

Computes the sum of a numerical sequence.
sequenceTotal(numbers) => Number

Mechanism to prevent unending iterations.
iterationGuard(max = 1e5)

Retrieves the maximum element from an array.
findMaximum(numbers, startingValue = undefined) => Number

Retrieves the minimum element from an array.
findMinimum(numbers, startingValue = undefined) => Number

Logs a deep copy of an object to the console.
dumpObjectSnapshot(value)

Performs prime factorization.
decomposeIntoPrimes(n) => { prime: exponent }

Constructs a two-dimensional array.
createMatrix(rowsCount, colsCount = 0, defaultValue = 0) => [[]]

Calculates the Greatest Common Divisor.
computeGCD(a, b) => Number

Calculates the Least Common Multiple.
computeLCM(a,b) => Number

Checks if one set is a proper subset of another.
isSubcollection(mainCollection, subCollection) => Boolean

Computes the union of two sets.
combineSets(a, b) => Set

Computes the intersection of two sets.
intersectSets(a, b) => Set

Computes the symmetric difference of two sets.
symmetricDifference(a, b) => Set

Computes the difference of two sets.
subtractSets(a, b) => Set

Enumerates all combinations of 'k' elements from an array.
enumerateCombinations(array, count) => [[]]

*/

let parsedLines = dataSource.split(/[\s\n]/); // Split input by whitespace or newlines
let loopSafetyCheck = 0; // Initialize counter for loop guard
let finalOutput = performCalculation(); // Execute the main logic
console.log(finalOutput); // Display the final computed result

if (finalOutput === undefined) {
  console.warn("computationOutcome is unset"); // Warn if the output is not defined
}
// Performance measurement concluded

// Reads and parses input values.
function acquireData(numRows = 1, numCols = 1, valueType = Number) {
  const totalElements = numRows * numCols; // Determine total number of elements to read
  let dataItems = parsedLines.splice(0, totalElements); // Extract relevant data from parsed lines

  if (valueType !== String) {
    dataItems = dataItems.map(valueType); // Convert data types if not string
  }
  if (numCols > 1) {
    const columnarData = new Array(numCols); // Prepare array for columnar storage
    for (let currentColIdx = 0; currentColIdx < numCols; currentColIdx++) {
      columnarData[currentColIdx] = []; // Initialize inner arrays
      for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
        columnarData[currentColIdx].push(
          dataItems[rowIdx * numCols + currentColIdx]
        ); // Populate columns
      }
    }
    dataItems = columnarData; // Reassign to columnar format
  }

  return dataItems; // Return the processed data
}

// Provides 'Affirmative' for truthy, 'Negative' for falsy.
function affirmativeNegative(inputBool) {
  return inputBool ? "Affirmative" : "Negative"; // Ternary operator for boolean check
}

// Computes the sum of a numerical sequence.
function sequenceTotal(numericalList) {
  return numericalList.reduce(
    (accumulator, currentElement) => accumulator + currentElement,
    0
  ); // Use reduce to sum elements
}

// Mechanism to prevent unending iterations.
function iterationGuard(maxIterations = 100000) {
  loopSafetyCheck++; // Increment the global loop counter
  if (loopSafetyCheck >= maxIterations) {
    throw new Error("Loop exceeded maximum allowed iterations."); // Throw error if limit reached
  }
}

// Retrieves the maximum element from an array.
function findMaximum(numericCollection, startingValue = undefined) {
  let maxValue =
    startingValue === undefined ? numericCollection[0] : startingValue; // Set initial max value
  for (const currentNum of numericCollection) {
    if (currentNum > maxValue) {
      maxValue = currentNum; // Update if a larger number is found
    }
  }
  return maxValue; // Return the greatest value
}

// Retrieves the minimum element from an array.
function findMinimum(numericCollection, startingValue = undefined) {
  let minValue =
    startingValue === undefined ? numericCollection[0] : startingValue; // Set initial min value
  for (const currentNum of numericCollection) {
    if (currentNum < minValue) {
      minValue = currentNum; // Update if a smaller number is found
    }
  }
  return minValue; // Return the smallest value
}

// Logs a deep copy of an object to the console.
function dumpObjectSnapshot(targetObject) {
  console.log(JSON.parse(JSON.stringify(targetObject))); // Deep clone and log
}

// Performs prime factorization.
function decomposeIntoPrimes(inputNumber) {
  const factorMap = {}; // Object to store prime factors and their exponents

  for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= inputNumber; divisorCandidate++) {
    if (inputNumber % divisorCandidate === 0) {
      inputNumber /= divisorCandidate; // Divide by factor
      factorMap[divisorCandidate] = 1; // Initialize count

      while (inputNumber % divisorCandidate === 0) {
        inputNumber /= divisorCandidate; // Continue dividing
        factorMap[divisorCandidate]++; // Increment exponent
      }
    }
  }

  if (inputNumber > 1) {
    factorMap[inputNumber] = 1; // If remaining number is prime, add it
  }

  return factorMap; // Return the map of prime factors
}

// Constructs a two-dimensional array.
function createMatrix(rowsCount, colsCount = 0, defaultValue = 0) {
  const matrixContainer = []; // Outer array for rows
  for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
    const rowArray = colsCount
      ? new Array(colsCount).fill(defaultValue)
      : []; // Create inner array, possibly filled
    matrixContainer.push(rowArray); // Add row to matrix
  }

  return matrixContainer; // Return the 2D array
}

// Calculates the Greatest Common Divisor.
function computeGCD(valA, valB) {
  if (valB === 0) {
    return valA; // Base case for Euclidean algorithm
  }
  return computeGCD(valB, valA % valB); // Recursive step
}

// Calculates the Least Common Multiple.
function computeLCM(numOne, numTwo) {
  const greatestCommonDivisor = (firstNum, secondNum) =>
    secondNum ? greatestCommonDivisor(secondNum, firstNum % secondNum) : firstNum; // Inner GCD function
  return (numOne * numTwo) / greatestCommonDivisor(numOne, numTwo); // LCM formula
}

// Checks if one set is a proper subset of another.
function isSubcollection(mainCollection, subCollection) {
  for (let elementItem of subCollection) {
    if (!mainCollection.has(elementItem)) {
      return false; // If any element is not in main, it's not a subset
    }
  }
  return true; // All elements found
}

// Computes the union of two sets.
function combineSets(collectionA, collectionB) {
  const unionResult = new Set(collectionA); // Start with elements from A
  for (const itemB of collectionB) {
    unionResult.add(itemB); // Add elements from B
  }
  return unionResult; // Return the combined set
}

// Computes the intersection of two sets.
function intersectSets(collectionA, collectionB) {
  let intersectionResult = new Set(); // Initialize an empty set for intersection
  for (let itemB of collectionB) {
    if (collectionA.has(itemB)) {
      intersectionResult.add(itemB); // Add common elements
    }
  }
  return intersectionResult; // Return the intersection set
}

// Computes the symmetric difference of two sets.
function symmetricDifference(collectionA, collectionB) {
  let diffResult = new Set(collectionA); // Start with elements from A
  for (let itemB of collectionB) {
    if (diffResult.has(itemB)) {
      diffResult.delete(itemB); // Remove if present (common)
    } else {
      diffResult.add(itemB); // Add if not present (unique to B)
    }
  }
  return diffResult; // Return the symmetric difference
}

// Computes the difference of two sets.
function subtractSets(collectionA, collectionB) {
  let differenceResult = new Set(collectionA); // Start with elements from A
  for (let itemB of collectionB) {
    differenceResult.delete(itemB); // Remove elements found in B
  }
  return differenceResult; // Return the difference set (A - B)
}

// Enumerates all combinations of 'k' elements from an array.
function enumerateCombinations(sourceArray, selectionCount) {
  const allCombinations = []; // Array to store all generated combinations

  function _generateRecursive({ currentSelection = [], remainingElements }) {
    if (currentSelection.length + remainingElements.length < selectionCount) {
      return; // Pruning: not enough elements left to form a combination of desired size
    }

    if (currentSelection.length < selectionCount) {
      for (let idx = 0; idx < remainingElements.length; idx++) {
        _generateRecursive({
          currentSelection: [...currentSelection, remainingElements[idx]],
          remainingElements: remainingElements.slice(idx + 1), // Correct slice for combinations
        });
      }
    } else {
      allCombinations.push(currentSelection); // Combination found, add to results
    }
  }

  _generateRecursive({ remainingElements: sourceArray }); // Start the recursive process

  return allCombinations; // Return all combinations
}

function calculatePermutations(totalItems, chosenItems) {
  let productValue = 1; // Initialize product
  for (let loopCounter = 0; loopCounter < chosenItems; loopCounter++) {
    productValue *= totalItems - loopCounter; // Multiply by decreasing values
  }
  return productValue; // Return the permutation count
}

function calculateCombinations(totalItems, chosenItems) {
  // Use permutation formula for combinations: P(n, r) / P(r, r)
  return (
    calculatePermutations(totalItems, chosenItems) /
    calculatePermutations(chosenItems, chosenItems)
  );
}