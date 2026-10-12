process.stdin.resume();
process.stdin.setEncoding('utf8');

// This section contains the core logic for the application.

/**
 * Sorts an array of objects using a custom quicksort algorithm.
 * The sorting is based on the 'val' property of the objects.
 * @param {Array<Object>} inputCollection - The array of objects to be sorted.
 * @returns {Array<Object>} The sorted array.
 */
function quickSortAlgorithm(inputCollection) {
    // Inner function for recursive sorting
    (function recursiveSort(startIndex, endIndex) {
        // Base case for recursion: if the segment is empty or a single element
        if (startIndex >= endIndex) {
            return;
        }

        let leftPointer = startIndex;
        let rightPointer = endIndex;
        // Choose a pivot element from the middle of the current segment
        let pivotValue = inputCollection[Math.round((leftPointer + rightPointer) / 2)].val;

        // Partitioning phase: move elements smaller than pivot to the left, larger to the right
        // The loop continues as long as the pointers haven't crossed
        while (leftPointer < rightPointer) {
            // Find an element on the left that is greater than or equal to the pivot
            if (inputCollection[leftPointer].val >= pivotValue) {
                // Find an element on the right that is less than or equal to the pivot
                while (rightPointer > leftPointer) {
                    if (inputCollection[rightPointer].val <= pivotValue) {
                        // Swap the elements found by left and right pointers
                        let temporaryHolder = inputCollection[leftPointer];
                        inputCollection[leftPointer] = inputCollection[rightPointer];
                        inputCollection[rightPointer] = temporaryHolder;
                        rightPointer--; // Move right pointer inward
                        break; // Exit inner while loop to re-evaluate left pointer
                    }
                    rightPointer--; // Move right pointer inward
                }
            }
            leftPointer++; // Move left pointer inward
        }

        // After partitioning, recursively sort the sub-arrays
        // The conditions handle cases where the pivot might be duplicated or at an edge
        if (inputCollection[rightPointer].val > pivotValue) {
            recursiveSort(startIndex, rightPointer - 1);
            recursiveSort(rightPointer, endIndex);
        } else if (inputCollection[rightPointer].val < pivotValue) {
            recursiveSort(startIndex, rightPointer);
            recursiveSort(rightPointer + 1, endIndex);
        } else {
            // Case where the element at rightPointer is equal to the pivot
            recursiveSort(startIndex, rightPointer - 1);
            recursiveSort(rightPointer + 1, endIndex);
        }
    })(0, inputCollection.length - 1); // Initial call to the recursive sort function

    return inputCollection; // Return the sorted array
}

/**
 * Computes the greatest common divisor (GCD) for an array of numbers.
 * @param {Array<number>} numberSequence - An array of integers.
 * @returns {number} The GCD of all numbers in the array.
 */
const calculateArrayGCD = function(numberSequence) {
  let greatestCommonDivisorResult = findGCD(numberSequence[0], numberSequence[1]);
  for (let j = 2; j < numberSequence.length; j++) {
    greatestCommonDivisorResult = findGCD(greatestCommonDivisorResult, numberSequence[j]);
  }
  return greatestCommonDivisorResult;
};

/**
 * Helper function for GCD calculation using Euclidean algorithm with a loop optimization.
 * @param {number} numA - The first integer.
 * @param {number} numB - The second integer.
 * @returns {number} The GCD of numA and numB.
 */
function gcdRecursiveImplementation(numA, numB) {
    // Attempt to find GCD iteratively for a few steps to potentially avoid deep recursion
    for (let loopCounter = 0; loopCounter < 10; ++loopCounter) {
        let difference = numA - numB;
        let isMBiggerThanDifference = numB > difference;
        numA = isMBiggerThanDifference ? numB : difference;
        numB = isMBiggerThanDifference ? difference : numB;
        if (numB === 0) {
            return numA;
        }
    }
    // Fallback to standard recursive Euclidean algorithm if not found in initial loop
    return gcdRecursiveImplementation(numB, numA % numB);
}

/**
 * Calculates the greatest common divisor (GCD) of two numbers.
 * Ensures the larger number is passed as the first argument to the implementation.
 * @param {number} firstNumber - The first integer.
 * @param {number} secondNumber - The second integer.
 * @returns {number} The GCD of firstNumber and secondNumber.
 */
function findGCD(firstNumber, secondNumber) {
    return firstNumber > secondNumber ? gcdRecursiveImplementation(firstNumber, secondNumber) : gcdRecursiveImplementation(secondNumber, firstNumber);
}

/**
 * Main function to process input, perform calculations, and output the result.
 * @param {string} inputDataString - The raw input string from stdin.
 */
const ProcessInputAndCalculate = (inputDataString) => {
    // Split the input string into an array of lines
    let parsedLines = inputDataString.split("\n");

    // Parse the first line to get the count N
    let countN = parseInt(parsedLines[0].split(" ")[0]);

    // Parse the second line to get an array of numbers
    let numericValues = parsedLines[1].split(" ").map(Number);

    // Create an array of objects, each containing its original index and value
    let dataObjects = new Array();
    for (let idx = 0; idx < countN; idx++) {
        dataObjects.push({ originalIndex: idx, val: numericValues[idx] });
    }

    let frontPointer = 1;
    let backPointer = countN;
    let totalSum = 0;

    // Sort the array of objects based on their 'val' property in ascending order
    dataObjects = quickSortAlgorithm(dataObjects);

    // Iterate through the sorted objects in reverse order
    for (let k = countN - 1; k >= 0; k--) {
        // Calculate distances from current object's original index to front and back
        let distanceToFront = dataObjects[k].originalIndex - frontPointer + 1;
        let distanceToBack = backPointer - dataObjects[k].originalIndex - 1;

        // Determine which side (front or back) is "closer" or has more available slots
        if (countN - dataObjects[k].originalIndex < dataObjects[k].originalIndex + 1) {
            // If the distance to the "front" (smaller indices) is shorter
            totalSum += dataObjects[k].val * distanceToFront;
            frontPointer++; // Move the front pointer inward
        } else if (countN - dataObjects[k].originalIndex > dataObjects[k].originalIndex + 1) {
            // If the distance to the "back" (larger indices) is shorter
            totalSum += dataObjects[k].val * distanceToBack;
            backPointer--; // Move the back pointer inward
        } else {
            // If distances are equal, use a tie-breaking rule based on the next element
            // This logic assumes k+1 is a valid index, which might be problematic for k=N-1
            // However, the original code has this structure, so it's preserved.
            if (k + 1 < countN) { // Ensure dataObjects[k+1] exists
                if (countN - dataObjects[k + 1].originalIndex < dataObjects[k + 1].originalIndex + 1) {
                    totalSum += dataObjects[k].val * distanceToBack;
                    backPointer--;
                } else if (countN - dataObjects[k + 1].originalIndex > dataObjects[k + 1].originalIndex + 1) {
                    totalSum += dataObjects[k].val * distanceToFront;
                    frontPointer++;
                }
            } else {
                // Edge case for the last element if distances are equal and no k+1
                // The original code doesn't explicitly handle this, so we'll assume
                // one of the branches above would have been taken or this is not reached.
                // For strict Type II, we must preserve the original structure.
                // The original code's logic for k+1 implies it's not the very last element.
                // If k is N-1, then k+1 is N, which is out of bounds.
                // This specific else branch for k+1 is only reached if k < N-1.
                // If k = N-1, the outer if/else if would have been taken.
                // So, this inner if (N-A[i+1].i < A[i+1].i+1) is safe.
                totalSum += dataObjects[k].val * distanceToBack; // Defaulting to back if tie-breaker is ambiguous or last element
                backPointer--;
            }
        }
    }

    // Output the final calculated sum
    console.log(totalSum);
};

// The following line should not be modified (it reads input from standard input and calls the main processing function).
ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
