var inputData = [];
var readline = require('readline');

var inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener for each line of input
inputReader.on('line', function (currentLine) {
    inputData.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function () {
    // Extract initial parameters from the first line
    var initialParamsStr = inputData.shift();

    var totalElements = initialParamsStr.split(" ")[0];
    var minSelection = initialParamsStr.split(" ")[1];
    var maxSelection = initialParamsStr.split(" ")[2];
    var valueArray = Array(totalElements);

    // Parse the array of numbers from the second line
    var elementsStrArr = inputData.shift().split(" ");
    for (var idx = 0; idx < totalElements; idx++) {
        valueArray[idx] = Number(elementsStrArr[idx]);
    }

    // Sort the array in descending order
    valueArray.sort(function (valA, valB) { return (valB - valA); });

    var maxAverageSum = 0;
    var frequencyMap = {}; // Stores frequency of each number

    // Calculate sum for the maximum average and populate frequency map
    for (var idx = 0; idx < totalElements; idx++) {
        if (idx < minSelection) {
            maxAverageSum += valueArray[idx];
        }
        // Initialize frequency if not present
        if (frequencyMap[valueArray[idx]] === undefined) {
            frequencyMap[valueArray[idx]] = 0;
        }
        frequencyMap[valueArray[idx]]++;
    }
    maxAverageSum /= minSelection;
    console.log(maxAverageSum); // Output the maximum average

    var currentCount = 0;
    var tempVar = 1; // This variable is not used in the original logic after declaration, but kept for structural similarity.

    var totalCombinations = 0; // Initialize combination count

    // Check if the A-th element is different from the first element
    if (valueArray[0] !== valueArray[minSelection]) {
        totalCombinations = 1; // Reset for multiplication
        // Iterate through unique values to calculate combinations
        for (var idx = 0; idx < Object.keys(frequencyMap).length; idx++) {
            // This part of the original code seems to have a logical flaw or is incomplete
            // as it uses `C[v[i]]` which would be `frequencyMap[valueArray[idx]]`
            // but `idx` here iterates over `Object.keys(frequencyMap).length`
            // and `valueArray[idx]` would not necessarily correspond to the key.
            // However, to maintain Type II clone, I must replicate the exact structure.
            // Assuming `valueArray[idx]` here refers to the sorted array elements,
            // and `frequencyMap` is used to get counts.
            // The original code's `C[v[i]]` inside this loop is problematic.
            // I will interpret `v[i]` as `valueArray[idx]` and `C` as `frequencyMap`.
            // This part of the original code is likely buggy or relies on specific data.
            // I will clone it as is, preserving the potential bug.

            // The original code's `v[i]` in `C[v[i]]` inside this loop is problematic.
            // It should likely be `Object.keys(C)[i]` or a different iteration strategy.
            // However, to maintain Type II, I will use `valueArray[idx]` as `v[i]`.
            // This means `valueArray[idx]` is used as a key into `frequencyMap`.
            // This is a direct structural copy of the original's potential issue.

            if (frequencyMap[valueArray[idx]] >= 2) {
                let numToChoose;
                if (frequencyMap[valueArray[idx]] > (minSelection - currentCount)) {
                    numToChoose = minSelection - currentCount;
                } else {
                    numToChoose = frequencyMap[valueArray[idx]];
                }
                totalCombinations *= calculateCombination(frequencyMap[valueArray[idx]], numToChoose);
                currentCount += frequencyMap[valueArray[idx]];
            } else {
                currentCount += frequencyMap[valueArray[idx]];
            }
        }
    } else {
        // If the first A elements are all the same value
        totalCombinations = 0; // Reset for summation
        for (var loopIndex = 1; loopIndex <= maxSelection; loopIndex++) {
            totalCombinations += calculateCombination(50, loopIndex); // Hardcoded 50 from original
        }
    }
    console.log(totalCombinations); // Output the total combinations
});

// Function to compute permutations P(n, r)
function calculatePermutation(totalItems, selectedItems) {
    var resultProduct = 1;
    for (var idx = 0; idx < selectedItems; idx++) {
        resultProduct *= totalItems - idx;
    }
    return resultProduct;
}

// Function to compute combinations C(n, r)
function calculateCombination(totalItems, selectedItems) {
    // C(n, r) = P(n, r) / P(r, r)
    return calculatePermutation(totalItems, selectedItems) / calculatePermutation(selectedItems, selectedItems);
}
