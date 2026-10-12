var numElementsA, numElementsB; // Declare variables for array sizes
var arrayOne = [], arrayTwo = []; // Initialize two empty arrays

// This function performs a binary search on 'arrayTwo'
// to check if a 'targetValue' exists within it.
function binaryFind(targetValue) {
    var leftIdx = 0, rightIdx = numElementsB; // Initialize search range boundaries
    // Continue the search as long as the range is valid
    while (rightIdx - leftIdx > 1) {
        // Calculate the middle index using bitwise right shift for efficiency
        var midIdx = (leftIdx + rightIdx) >> 1;
        // If the element at midIdx is less than or equal to the target,
        // narrow the search to the right half (including midIdx)
        if (arrayTwo[midIdx] <= targetValue) {
            leftIdx = midIdx;
        }
        // Otherwise, narrow the search to the left half (excluding midIdx)
        else {
            rightIdx = midIdx;
        }
    }
    // After the loop, 'leftIdx' points to the potential match.
    // Return true if the element at 'leftIdx' is exactly the 'targetValue'.
    return arrayTwo[leftIdx] === targetValue;
}

// The primary function that orchestrates the program's logic.
function executeProgram() {
    // Loop as long as there's input for the first array's size.
    while (numElementsA = readNextNumber()) {
        numElementsB = readNextNumber(); // Read the size for the second array.

        // Populate 'arrayOne' with 'numElementsA' values from input.
        iterateRange(numElementsA, function(currentIdx) {
            arrayOne[currentIdx] = readNextNumber();
        });
        // Populate 'arrayTwo' with 'numElementsB' values from input.
        iterateRange(numElementsB, function(currentIdx) {
            arrayTwo[currentIdx] = readNextNumber();
        });

        // Sort both arrays in ascending numerical order.
        arrayOne.sort(function(valU, valV) {
            return valU - valV;
        });
        arrayTwo.sort(function(valU, valV) {
            return valU - valV;
        });

        // Calculate the sum of elements in 'arrayOne'.
        var sumA = 0;
        iterateRange(numElementsA, function(currentIdx) {
            sumA += arrayOne[currentIdx];
        });
        // Calculate the sum of elements in 'arrayTwo'.
        var sumB = 0;
        iterateRange(numElementsB, function(currentIdx) {
            sumB += arrayTwo[currentIdx];
        });

        // Determine the required difference for a swap to balance sums.
        // If we swap 'x' from arrayOne with 'y' from arrayTwo,
        // new_sumA = sumA - x + y
        // new_sumB = sumB - y + x
        // For new_sumA == new_sumB:
        // sumA - x + y = sumB - y + x
        // 2y - 2x = sumB - sumA
        // y - x = (sumB - sumA) / 2
        // So, y = x + (sumB - sumA) / 2. Let differenceHalf = (sumB - sumA) / 2.
        var differenceHalf = Math.floor((sumB - sumA) / 2);
        // If the total difference is odd, an integer swap cannot balance the sums.
        if ((sumB - sumA) !== (2 * differenceHalf)) {
            displayOutput(-1);
            continue; // Skip to the next test case.
        }

        var foundPair = false; // Flag to indicate if a suitable pair was found.
        // Iterate through 'arrayOne' to find a potential 'x' value.
        iterateRange(numElementsA, function(currentIdx) {
            // Check if 'y' (which is x + differenceHalf) exists in 'arrayTwo'.
            if (binaryFind(arrayOne[currentIdx] + differenceHalf)) {
                // If found, print the pair and set the flag.
                displayOutput(arrayOne[currentIdx] + ' ' + (arrayOne[currentIdx] + differenceHalf));
                foundPair = true;
                return false; // Return false to break out of the 'iterateRange' loop.
            }
        });
        // If no pair was found after checking all elements.
        if (!foundPair) {
            displayOutput(-1);
        }

        // Clear arrays for the next iteration or test case.
        arrayOne = [];
        arrayTwo = [];
    }
}

// A flexible utility function for iterating.
// Can be called as iterateRange(count, callback) or iterateRange(start, end, callback).
function iterateRange(startVal, endVal, callbackFn) {
    // Handle the overloaded function signature: if 'callbackFn' is undefined,
    // it means the first form (count, callback) was used.
    if (callbackFn === undefined) {
        callbackFn = endVal; // The second argument is the callback.
        endVal = startVal;   // The first argument is the end count.
        startVal = 0;        // Start from 0.
    }
    // Loop from 'startVal' up to (but not including) 'endVal'.
    for (var currentIdx = startVal; currentIdx < endVal; ++currentIdx) {
        // If the callback function returns 'false', stop the iteration.
        if (callbackFn(currentIdx) === false) {
            break;
        }
    }
}

var inputBuffer = ''; // Global variable to store raw input data.

// Function to extract and convert the next number from the input buffer.
function readNextNumber() {
    return +inputBuffer.pop(); // Pop the last element and convert to number.
}
// Function to extract the next string from the input buffer.
function readNextString() {
    return inputBuffer.pop();
}
// Function to print a value to the console.
function displayOutput(valueToPrint) {
    console.log(valueToPrint);
}

// Set up standard input stream handling.
process.stdin.resume(); // Ensure the process doesn't exit prematurely.
process.stdin.setEncoding('utf8'); // Specify the character encoding for input.
// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
    inputBuffer += dataChunk; // Append new data to the buffer.
});
// Event listener for when all input has been received.
process.stdin.on('end', function() {
    // Process the accumulated input:
    // 1. Trim leading/trailing whitespace.
    // 2. Split into an array of strings by any whitespace.
    // 3. Reverse the array so 'pop()' retrieves elements in original order.
    inputBuffer = inputBuffer.trim().split(/\s+/).reverse();
    executeProgram(); // Start the main program logic.
});
