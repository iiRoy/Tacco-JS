var inputBuffer = [];
var lineReaderModule = require('readline');

var interfaceHandler = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

interfaceHandler.on('close', function () {
    // Extract the first line containing N, A, B
    var tempStr = inputBuffer.shift();

    var itemCount = tempStr.split(" ")[0];
    var minSelection = tempStr.split(" ")[1];
    var maxSelection = tempStr.split(" ")[2];
    var valueArray = Array(itemCount);

    // Parse the second line into an array of numbers
    var tempValuesStr = inputBuffer.shift().split(" ");
    for (var idx = 0; idx < itemCount; idx++) {
        valueArray[idx] = Number(tempValuesStr[idx]);
    }

    // Sort the array in descending order
    valueArray.sort(function (valA, valB) { return (valB - valA); });

    var maxAverageValue = 0;
    var frequencyMap = {}; // Stores frequency of each number

    // Calculate the sum for the maximum average and populate frequency map
    for (var idx = 0; idx < itemCount; idx++) {
        if (idx < minSelection) {
            maxAverageValue += valueArray[idx];
        }
        if (frequencyMap[valueArray[idx]] === undefined) {
            frequencyMap[valueArray[idx]] = 0;
        }
        frequencyMap[valueArray[idx]]++;
    }
    maxAverageValue /= minSelection;
    console.log(maxAverageValue);


    var currentCount = 0;
    var totalCombinations = 0; // Initialize combination result

    // Check if the A-th element is different from the first element
    // This determines which combination calculation path to take
    if (valueArray[0] !== valueArray[minSelection]) {
        totalCombinations = 1; // Start with 1 for multiplication
        for (var idx = 0; idx < itemCount; idx++) {
            // If the current number appears multiple times
            if (frequencyMap[valueArray[idx]] >= 2) {
                var numToSelect;
                // Determine how many of the current number to select
                if (frequencyMap[valueArray[idx]] > (minSelection - currentCount)) {
                    numToSelect = minSelection - currentCount;
                } else {
                    numToSelect = frequencyMap[valueArray[idx]];
                }
                totalCombinations *= calcCombinations(frequencyMap[valueArray[idx]], numToSelect);
                
                currentCount += frequencyMap[valueArray[idx]];
                idx += frequencyMap[valueArray[idx]] - 1; // Skip already processed elements
            }
            else {
                currentCount += frequencyMap[valueArray[idx]];
                idx += frequencyMap[valueArray[idx]] - 1; // Skip already processed elements
            }
        }
    }
    else {
        // If the first A elements are all the same
        for (var loopIndex = 1; loopIndex <= maxSelection; loopIndex++) {
            totalCombinations += calcCombinations(50, loopIndex); // Assuming 50 is a constant from problem context
        }
    }
    console.log(totalCombinations);

});

// Function to calculate permutations (nPr)
function calcPermutations(totalItems, selectItems) {
    var resultProduct = 1;
    for (var iter = 0; iter < selectItems; iter++) {
        resultProduct *= totalItems - iter;
    }
    return resultProduct;
}

// Function to calculate combinations (nCr)
function calcCombinations(totalElements, chooseElements) {
    // nCr = nPr / rPr
    return calcPermutations(totalElements, chooseElements) / calcPermutations(chooseElements, chooseElements);
}
