let countElements;

/**
 * Performs a counting sort on an array of non-negative integers.
 * This function sorts the 'inputArray' and places the result into 'outputArray'.
 *
 * @param {number[]} inputArray - The array to be sorted.
 * @param {number[]} outputArray - The array to store the sorted elements.
 * @param {number} maxValue - The maximum possible value in the inputArray.
 */
function performCountingSort(inputArray, outputArray, maxValue) {
    // Initialize an array to store the frequency of each element.
    // The size is maxValue + 1 to accommodate values from 0 to maxValue.
    const frequencyCounts = new Array(maxValue + 1);
    for (let idx = 0; idx <= maxValue; idx++) {
        frequencyCounts[idx] = 0;
    }

    // Count the occurrences of each element in the inputArray.
    for (let jdx = 0; jdx < countElements; jdx++) {
        frequencyCounts[inputArray[jdx]]++;
    }

    // Modify frequencyCounts to store the actual position of each element in the outputArray.
    // Each element frequencyCounts[idx] will now contain the sum of all counts up to idx.
    for (let idx = 1; idx <= maxValue; idx++) {
        frequencyCounts[idx] += frequencyCounts[idx - 1];
    }

    // Build the outputArray by placing elements in their sorted positions.
    // Iterate through the inputArray from left to right.
    // For each element, place it at its correct sorted position and then decrement its count.
    for (let jdx = 0; jdx < countElements; jdx++) {
        // The position is frequencyCounts[inputArray[jdx]] - 1, then decrement frequencyCounts[inputArray[jdx]].
        outputArray[--frequencyCounts[inputArray[jdx]]] = inputArray[jdx];
    }
}

/**
 * Main function to process the input data, calculate the minimum cost to sort weights.
 * The problem involves sorting an array of weights using swaps, where each swap
 * costs the sum of the two swapped weights. It uses cycle decomposition.
 *
 * @param {string} rawData - The raw input string from stdin.
 */
function processInputData(rawData) {
    // Split the input string into lines.
    rawData = rawData.split('\n');

    // Parse the number of elements from the first line.
    countElements = parseInt(rawData[0], 10);

    // Initialize arrays for unsorted and sorted weights.
    const unsortedWeights = new Array(countElements);
    const sortedWeights = new Array(countElements);

    // Parse the weights from the second line.
    rawData[1] = rawData[1].split(' ');
    for (let idx = 0; idx < countElements; idx++) {
        unsortedWeights[idx] = parseInt(rawData[1][idx], 10);
    }

    // Sort the weights using the custom counting sort function.
    // The maximum weight is assumed to be 10000.
    performCountingSort(unsortedWeights, sortedWeights, 10000);

    // Initialize variables for tracking matches, position mappings, and total cost.
    let matchCount = 0; // Number of elements already in their correct sorted position.
    const positionMap = new Array(countElements); // positionMap[i] = j means unsortedWeights[i] should be at sortedWeights[j].
    const reversePositionMap = new Array(countElements); // reversePositionMap[j] = i means sortedWeights[j] is currently at unsortedWeights[i].

    // Calculate initial matchCount (elements already in place).
    for (let idx = 0; idx < countElements; idx++) {
        if (unsortedWeights[idx] === sortedWeights[idx]) {
            matchCount++;
        }
    }

    // Populate positionMap and reversePositionMap.
    // This nested loop finds where each unsorted weight belongs in the sorted array
    // and where each sorted weight is currently located in the unsorted array.
    for (let idx = 0; idx < countElements; idx++) {
        for (let jdx = 0; jdx < countElements; jdx++) {
            if (unsortedWeights[idx] === sortedWeights[jdx]) {
                positionMap[idx] = jdx;
                reversePositionMap[jdx] = idx;
            }
        }
    }

    let tempValue; // Temporary variable for swaps.
    let totalCost = 0; // Accumulator for the total cost of swaps.

    // First pass: Identify and resolve 2-cycles (swaps between two elements).
    // A 2-cycle exists if unsortedWeights[idx] should be where unsortedWeights[positionMap[idx]] is,
    // and unsortedWeights[positionMap[idx]] should be where unsortedWeights[idx] is.
    for (let idx = 0; idx < countElements; idx++) {
        if (positionMap[positionMap[idx]] === idx && positionMap[idx] !== idx) {
            matchCount += 2; // Two elements are now in their correct positions.
            totalCost += unsortedWeights[idx] + unsortedWeights[positionMap[idx]]; // Add cost of swapping them.

            // Perform the swap in the unsortedWeights array.
            tempValue = unsortedWeights[idx];
            unsortedWeights[idx] = unsortedWeights[positionMap[idx]];
            unsortedWeights[positionMap[idx]] = tempValue;

            // Update reversePositionMap to reflect the swap.
            // Let j = positionMap[idx]. We swapped unsortedWeights[idx] and unsortedWeights[j].
            // Before: sortedWeights[idx] was at unsortedWeights[j], sortedWeights[j] was at unsortedWeights[idx].
            // After: sortedWeights[idx] is at unsortedWeights[idx], sortedWeights[j] is at unsortedWeights[j].
            tempValue = reversePositionMap[idx]; // tempValue holds j (where sortedWeights[idx] was)
            reversePositionMap[idx] = reversePositionMap[positionMap[idx]]; // reversePositionMap[idx] becomes idx
            reversePositionMap[tempValue] = tempValue; // reversePositionMap[j] becomes j

            // Update positionMap to reflect the swap.
            // Before: unsortedWeights[idx] was sortedWeights[j], unsortedWeights[j] was sortedWeights[idx].
            // After: unsortedWeights[idx] is sortedWeights[idx], unsortedWeights[j] is sortedWeights[j].
            tempValue = positionMap[idx]; // tempValue holds j (where unsortedWeights[idx] should be)
            positionMap[idx] = positionMap[positionMap[idx]]; // positionMap[idx] becomes idx
            positionMap[tempValue] = tempValue; // positionMap[j] becomes j
        }
    }

    // Second pass: Resolve remaining cycles (cycles of length 3 or more).
    // This loop continues until all elements are in their correct sorted positions.
    while (matchCount < countElements) {
        let minimumWeight = 1000000; // Initialize with a large value to find the smallest weight.
        let minimumWeightIndex; // Index of the smallest weight not yet in place.

        // Find the smallest weight that is not yet in its correct sorted position.
        for (let idx = 0; idx < countElements; idx++) {
            if (minimumWeight > unsortedWeights[idx] && positionMap[idx] !== idx) {
                minimumWeight = unsortedWeights[idx];
                minimumWeightIndex = idx;
            }
        }

        // Traverse the cycle starting from minimumWeightIndex and perform swaps.
        // Each swap moves one element closer to its sorted position.
        while (positionMap[minimumWeightIndex] !== minimumWeightIndex) {
            // Add the cost of swapping the current element with the element that should be in its place.
            totalCost += unsortedWeights[minimumWeightIndex] + unsortedWeights[reversePositionMap[minimumWeightIndex]];

            // Perform the swap in the unsortedWeights array.
            tempValue = unsortedWeights[minimumWeightIndex];
            unsortedWeights[minimumWeightIndex] = unsortedWeights[reversePositionMap[minimumWeightIndex]];
            unsortedWeights[reversePositionMap[minimumWeightIndex]] = tempValue;

            // Update positionMap to reflect the swap.
            // Let k = reversePositionMap[minimumWeightIndex] (where sortedWeights[minimumWeightIndex] was).
            // We swapped unsortedWeights[minimumWeightIndex] and unsortedWeights[k].
            // Before: unsortedWeights[minimumWeightIndex] was sortedWeights[positionMap[minimumWeightIndex]],
            //         unsortedWeights[k] was sortedWeights[minimumWeightIndex].
            // After: unsortedWeights[minimumWeightIndex] is sortedWeights[minimumWeightIndex],
            //        unsortedWeights[k] is sortedWeights[positionMap[minimumWeightIndex]].
            tempValue = positionMap[minimumWeightIndex]; // Store the original positionMap[minimumWeightIndex]
            positionMap[minimumWeightIndex] = positionMap[reversePositionMap[minimumWeightIndex]]; // positionMap[minimumWeightIndex] becomes positionMap[k]
            positionMap[reversePositionMap[minimumWeightIndex]] = tempValue; // positionMap[k] becomes original positionMap[minimumWeightIndex]

            // Update reversePositionMap to reflect the swap.
            // Let k = reversePositionMap[minimumWeightIndex] (where sortedWeights[minimumWeightIndex] was).
            // After swap: sortedWeights[minimumWeightIndex] is at unsortedWeights[minimumWeightIndex].
            //             sortedWeights[positionMap[k]] is at unsortedWeights[k].
            tempValue = reversePositionMap[minimumWeightIndex]; // Store the original reversePositionMap[minimumWeightIndex] (which is k)
            reversePositionMap[positionMap[tempValue]] = tempValue; // reversePositionMap[positionMap[k]] becomes k
            reversePositionMap[minimumWeightIndex] = minimumWeightIndex; // reversePositionMap[minimumWeightIndex] becomes minimumWeightIndex

            // Move to the next element in the cycle (the one that was just moved out of minimumWeightIndex's spot).
            minimumWeightIndex = tempValue;
            matchCount++; // One more element is now in its correct position.
        }
        matchCount++; // The element at minimumWeightIndex is now in its correct position.
    }

    // Output the total minimum cost.
    console.log(totalCost);
}

// Read input from stdin and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
