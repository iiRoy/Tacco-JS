// This script initializes and manages the standard input stream for data processing.
process.stdin.resume();

// Setting the character encoding to UTF-8 ensures proper handling of text data.
process.stdin.setEncoding('utf8');

// A mutable string buffer to accumulate all incoming data chunks from standard input.
let globalBuffer = '';


// An event listener is attached to the 'data' event, which fires when input data is available.
process.stdin.on('data', function(dataPiece) {
    // Each fragment of data received is appended to our accumulating global buffer.
    globalBuffer += dataPiece;
});


// Another event listener is set up for the 'end' event, signaling the termination of input.
process.stdin.on('end', function() {
    // Upon stream completion, the buffered input is split into an array of lines,
    // and then passed to the primary function for further analytical processing.
    ProcessEntry(globalBuffer.split(/\r?\n/));
});


// The central function orchestrating the parsing of input data and the initiation of the core algorithm.
function ProcessEntry ( linesArray ) {

    // Extract the numerical value from the first line, representing the count of data sets or items.
    let numItems = parseInt(linesArray[0], 10);


    // Declare and initialize a two-dimensional array (matrix) to store feature data.
    let featureMatrix = new Array(numItems);


    // Loop through each item to populate its corresponding feature vector.
    for ( let idxRow = 0; idxRow < numItems; idxRow++ ) {
        // Each feature vector (row) is fixed to contain 10 elements.
        featureMatrix[idxRow] = new Array(10);

        // Split the relevant input line by spaces to get individual string arguments.
        let lineSegments = linesArray[1 + idxRow].split(' ');

        // Convert and assign each argument as an integer into the feature matrix.
        for ( let idxCol = 0; idxCol < 10; idxCol++ ) {
            featureMatrix[idxRow][idxCol] = parseInt(lineSegments[idxCol], 10);
        }
    }


    // Similarly, declare and prepare a second two-dimensional array for profit values.
    let profitMatrix = new Array(numItems);


    // Iterate again to fill the profit matrix using subsequent input lines.
    for ( let idxRow = 0; idxRow < numItems; idxRow++ ) {
        // Each profit vector (row) also has 10 elements.
        profitMatrix[idxRow] = new Array(10);

        // Parse the appropriate line from the input for profit data.
        let lineSegments = linesArray[1 + numItems + idxRow].split(' ');

        // Populate the profit matrix with parsed integer values.
        for ( let idxCol = 0; idxCol < 10; idxCol++ ) {
            profitMatrix[idxRow][idxCol] = parseInt(lineSegments[idxCol], 10);
        }
    }


    // Create a boolean array to represent the activation status of 10 distinct states.
    let activeStates = new Array(10);
    // Initialize all states to be inactive (false).
    activeStates.fill(false);


    // A variable to store the ultimate computed result from the search algorithm.
    let finalCalculation = 0;


    // Invoke the recursive depth-first search function to find the optimal configuration.
    finalCalculation = deepSearch(0, activeStates, featureMatrix, profitMatrix);


    // Print the maximum profit or calculated value to the standard output.
    console.log(finalCalculation);


    // A return value of 0 typically indicates successful program execution.
    return 0;
}


// This recursive function performs a depth-first exploration to determine the maximum possible profit.
// It considers activating or deactivating each of the 10 states.
function deepSearch(currentDepth, activeStates, featureMatrix, profitMatrix) {

    // The base case for the recursion: all 10 states have been considered.
    if (currentDepth >= 10) {

        // A flag to quickly determine if there are no active states in this configuration.
        let noActiveStates = true;
        // Iterate through the activeStates array to verify this condition.
        for (let outerIdx = 0; outerIdx < activeStates.length; outerIdx++) {
            if (activeStates[outerIdx]) {
                noActiveStates = false; // An active state was found.
                break; // No need to check further.
            }
        }

        // If no states are active, this specific path is considered invalid or yields no profit.
        if (noActiveStates) {
            // Return the smallest safe integer to ensure this path is not chosen as maximum.
            return Number.MIN_SAFE_INTEGER;
        }


        // An array to count how many active states overlap with features for each item.
        let overlapCounts = new Array(10);
        // Ensure all counts start from zero.
        overlapCounts.fill(0);


        // Iterate through each row of the feature matrix (each item).
        for (let outerIdx = 0; outerIdx < featureMatrix.length; outerIdx++) {
            // For each item, check its features against the currently active states.
            for (let innerIdx = 0; innerIdx < 10; innerIdx++) {
                // If a state is active AND the item has that feature (represented by '1').
                if (activeStates[innerIdx] && featureMatrix[outerIdx][innerIdx] == 1) {
                    overlapCounts[outerIdx]++; // Increment the overlap count for this item.
                }
            }
        }


        // Variable to accumulate the total profit for this particular state configuration.
        let currentProfit = 0;
        // Sum up the profits based on the calculated overlap counts for each item.
        for (let outerIdx = 0; outerIdx < profitMatrix.length; outerIdx++) {
            // Add the corresponding profit from the profit matrix.
            currentProfit += profitMatrix[outerIdx][overlapCounts[outerIdx]];
        }

        // Return the accumulated profit for this completed branch of the search.
        return currentProfit;
    }


    // Variables to hold the results of the two recursive branches (state active vs. state inactive).
    let resultOption1 = 0;
    let resultOption2 = 0;


    // Explore the path where the current state (currentDepth) is NOT activated.
    // Recursively call deepSearch for the next state, passing the current activeStates as is.
    resultOption1 = deepSearch(currentDepth + 1, activeStates, featureMatrix, profitMatrix);


    // Explore the path where the current state (currentDepth) IS activated.
    // Temporarily set the current state to active.
    activeStates[currentDepth] = true;
    // Recursively call deepSearch for the next state with the current state now active.
    resultOption2 = deepSearch(currentDepth + 1, activeStates, featureMatrix, profitMatrix);
    // Important: Backtrack by resetting the current state to inactive.
    // This ensures that subsequent branches of the recursion do not inherit this temporary activation.
    activeStates[currentDepth] = false;


    // Compare the results from both possibilities and return the greater profit.
    if (resultOption1 > resultOption2) {
        return resultOption1;
    }
    else {
        return resultOption2;
    }
}