// Global variables for memoization table and total item count
var memoizationTable;
var totalItems;

// This function processes the raw input data
function ProcessInput(rawData) {
    // Clean and parse the incoming text data
    rawData = rawData .trim() .split("\n") .map(  function(element) { return element .split(" "); }  ) ;
    
    // Extract the total number of items from the first line
    let itemCount = parseInt(rawData[0][0], 10);
    
    // Parse the item values from the second line
    let itemValues = rawData[1] .map( val => parseInt(val, 10) );
    
    // Initialize an array to store frequency counts for each category
    let freqCounts = [0, 0, 0, 0];
    
    // Populate the frequency counts based on item values
    for ( let idx = 0 ; idx < itemCount ; idx++ ) {
        freqCounts[itemValues[idx]]++ ;
    }
    
    // Calculate the total number of active items (excluding category 0)
    totalItems = freqCounts[1] + freqCounts[2] + freqCounts[3];
    
    // Initialize a memoization table for dynamic programming
    memoizationTable = [];
    memoizationTable[totalItems - 1] = [[], [totalItems]]; // Initialize a specific entry for base cases
    
    // Output the computed expected value
    console.log(CalculateExpectedValue(freqCounts));
}

// This recursive function calculates the expected value using dynamic programming
function CalculateExpectedValue(freqCounts) {
    // Variables for temporary storage
    let nonZeroIndices;
    let resultValue;

    // Ensure the memoization table structure exists for the current state
    if (memoizationTable[freqCounts[0]] == null) {
        memoizationTable[freqCounts[0]] = [];
        memoizationTable[freqCounts[0]][freqCounts[1]] = [];
    } else if (memoizationTable[freqCounts[0]][freqCounts[1]] == null) {
        memoizationTable[freqCounts[0]][freqCounts[1]] = [];
    }

    // Check if the result for the current state is already memoized
    if (memoizationTable[freqCounts[0]][freqCounts[1]][freqCounts[2]] == null) {
        // If not memoized, compute the value
        nonZeroIndices = getNonZeroIndexes(freqCounts);

        // Check if all categories (1, 2, 3) are non-zero, indicating a specific calculation path
        if (nonZeroIndices.length === 4) {
            // Calculation for the full state transition
            resultValue = 1 + (
                CalculateExpectedValue([freqCounts[0] + 1, freqCounts[1] - 1, freqCounts[2], freqCounts[3]]) * freqCounts[1] +
                CalculateExpectedValue([freqCounts[0], freqCounts[1] + 1, freqCounts[2] - 1, freqCounts[3]]) * freqCounts[2] +
                CalculateExpectedValue([freqCounts[0], freqCounts[1], freqCounts[2] + 1, freqCounts[3] - 1]) * freqCounts[3]
            ) / totalItems;
            resultValue /= (1 - freqCounts[0] / totalItems);
        } else {
            // General calculation for states where some categories might be zero
            resultValue = 0;
            for (let index of nonZeroIndices) {
                if (index === 0) continue; // Skip category 0 as it's a special case
                
                let tempCounts = [];
                // Create a temporary array to represent the next state
                tempCounts[index] = freqCounts[index] - 1;
                tempCounts[index - 1] = freqCounts[index - 1] + 1;
                tempCounts[(index + 1) % 4] = freqCounts[(index + 1) % 4];
                tempCounts[(index + 2) % 4] = freqCounts[(index + 2) % 4];
                
                resultValue += CalculateExpectedValue(tempCounts) * freqCounts[index];
            }
            resultValue = (resultValue / totalItems) + 1;
            resultValue /= (1 - freqCounts[0] / totalItems);
        }
        
        // Store the computed result in the memoization table
        memoizationTable[freqCounts[0]][freqCounts[1]][freqCounts[2]] = resultValue;
        return resultValue;

    } else {
        // If the result is already memoized, return it directly
        return memoizationTable[freqCounts[0]][freqCounts[1]][freqCounts[2]];
    }
}

// Helper function to find indices of non-zero elements in an array
function getNonZeroIndexes(inputArray) {
    let nonZeroes = [];
    for (let currentIdx = 0; currentIdx < inputArray.length; currentIdx++) {
        if (inputArray[currentIdx] !== 0) {
            nonZeroes.push(currentIdx);
        }
    }
    return nonZeroes;
}

// Execute the main processing function with data read from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));