function produceArrangements(initialSequence) {
    // Determine the total number of elements in the given sequence.
    var sequenceLength = initialSequence.length;

    // Initialize the collection of all permutations with a sliced copy of the original.
    var allArrangements = [initialSequence.slice()];

    // 'controlVector' is an auxiliary array used in the algorithm, initialized with zeros.
    var controlVector = new Array(sequenceLength).fill(0);

    // 'currentPosition' is the main loop counter, starting from the second element.
    var currentPosition = 1;

    // 'swapIndex' and 'tempValue' are temporary variables used during element swaps.
    var swapIndex, tempValue;


    // The main loop continues as long as 'currentPosition' is within the sequence bounds.
    while (currentPosition < sequenceLength) {
        // Check if the element at 'currentPosition' can be rotated based on the algorithm's state.
        if (controlVector[currentPosition] < currentPosition) {
            // Calculate the 'swapIndex' based on parity of 'currentPosition' and 'controlVector' value.
            swapIndex = currentPosition % 2 && controlVector[currentPosition];

            // Store the element at 'currentPosition' in 'tempValue' to facilitate the swap.
            tempValue = initialSequence[currentPosition];

            // Perform the first part of the swap: move element from 'swapIndex' to 'currentPosition'.
            initialSequence[currentPosition] = initialSequence[swapIndex];

            // Complete the swap: move 'tempValue' (original element at 'currentPosition') to 'swapIndex'.
            initialSequence[swapIndex] = tempValue;

            // Increment the counter in the 'controlVector' for the current position.
            ++controlVector[currentPosition];

            // Reset 'currentPosition' to 1 to re-evaluate permutations from the beginning of the sequence.
            currentPosition = 1;

            // Add a deep copy of the current permutation to the collection of all arrangements.
            allArrangements.push(initialSequence.slice());
        } else {
            // If the element cannot be rotated further, reset its 'controlVector' entry to zero.
            controlVector[currentPosition] = 0;

            // Move to the next element in the sequence to continue permutation generation.
            ++currentPosition;
        }
    }
    // Return the complete list of generated permutations for the initial sequence.
    return allArrangements;
}


// --- Precomputation Section ---
// This section pre-calculates permutations for arrays of different sizes (up to 10 elements).
// 'precomputedOrders' will store permutations for arrays of length N at index N.
var precomputedOrders = [null]; // Using null at index 0 for alignment, as permutations start from size 1.


// Loop from 0 up to 9 to generate permutations for arrays of size 1 to 10.
for (var elementCount = 0; elementCount < 10; elementCount++) {
    // Create a temporary array for the current size.
    var elementList = [];

    // Populate the temporary array with integer values from 0 up to 'elementCount'.
    for (var valueIndex = 0; valueIndex < elementCount + 1; valueIndex++) {
        elementList.push(valueIndex);
    }

    // Store the permutations of 'elementList' in 'precomputedOrders' at the corresponding index.
    precomputedOrders[elementCount + 1] = produceArrangements(elementList);
}


// --- Main Program Logic ---
// Read the entire input from standard input as a UTF-8 encoded string.
var fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim leading/trailing whitespace and split the input string into an array of individual lines.
var inputLines = fileContents.trim().split("\n");


// Loop indefinitely to process multiple test cases until an explicit exit condition is met.
while (true) {
    // Extract the first line from 'inputLines', convert it to a number,
    // representing the number of items for the current test case.
    var numEntries = inputLines.shift() - 0;

    // If 'numEntries' is 0, it signifies the end of input, so break out of the processing loop.
    if (numEntries === 0) {
        break;
    }

    // Initialize an array to store detailed information for each item.
    var taskInfo = [];

    // Read 'numEntries' lines, each containing space-separated details for an item.
    for (var entryIndex = 0; entryIndex < numEntries; entryIndex++) {
        taskInfo[entryIndex] = inputLines.shift().split(" ");
    }

    // Process 'taskInfo': convert numerical parts (weight, capacity) from strings to actual numbers.
    taskInfo = taskInfo.map(itemData => [
        itemData[0],    // Item name (string).
        itemData[1] - 0,  // Item weight (converted to number).
        itemData[2] - 0   // Item capacity constraint (converted to number).
    ]);

    // Retrieve the pre-calculated permutations for the current 'numEntries' from the cache.
    var availableOrders = precomputedOrders[numEntries];

    // Initialize 'maximumRatio' to track the highest score found across all permutations.
    var maximumRatio = 0;

    // 'optimalSequence' will store the permutation that yields the 'maximumRatio'.
    var optimalSequence = "";


    // Iterate through each possible permutation for the current set of items.
    for (var permutationIndex = 0; permutationIndex < availableOrders.length; permutationIndex++) {
        // Get the current permutation, which is an array of item indices.
        var currentOrder = availableOrders[permutationIndex];

        // 'conditionMet' flag indicates if the current permutation is valid based on capacity constraints.
        var conditionMet = true;

        // 'accumulatedMass' tracks the total weight of items processed so far in the current order.
        var accumulatedMass = 0;

        // 'accumulatedProduct' calculates the sum of (item weight * its position in the sequence).
        var accumulatedProduct = 0;


        // Iterate through each item within the 'currentOrder'.
        for (var orderPosition = 0; orderPosition < currentOrder.length; orderPosition++) {
            // Get the original index of the item based on its position in the current permutation.
            var originalItemIndex = currentOrder[orderPosition];

            // Check if the current accumulated mass exceeds the individual capacity constraint
            // associated with the item at 'originalItemIndex'. This implies that `taskInfo[originalItemIndex][2]`
            // represents a maximum allowed cumulative weight for this specific item's processing point.
            if (accumulatedMass > taskInfo[originalItemIndex][2]) {
                conditionMet = false; // Mark the permutation as invalid.
                break; // No need to check further elements in this permutation.
            }

            // Add the current item's weight to the running total accumulated mass.
            accumulatedMass += taskInfo[originalItemIndex][1];

            // Add the weighted product (item weight multiplied by its 1-based position in the sequence).
            accumulatedProduct += taskInfo[originalItemIndex][1] * (orderPosition + 1);
        }

        // If the permutation is valid (all constraints met) AND its calculated ratio
        // (accumulatedProduct / accumulatedMass) is higher than the current maximum ratio.
        if (conditionMet && accumulatedProduct / accumulatedMass > maximumRatio) {
            maximumRatio = accumulatedProduct / accumulatedMass; // Update the maximum ratio.
            optimalSequence = currentOrder; // Store this permutation as the new optimal sequence.
        }
    }

    // After evaluating all permutations, extract the names of items in the 'optimalSequence'.
    // Reverse the order for output as per problem requirements (last item first).
    // Join the names with newline characters and print the final result to the console.
    console.log(optimalSequence.map(element => taskInfo[element][0]).reverse().join("\n"));
}