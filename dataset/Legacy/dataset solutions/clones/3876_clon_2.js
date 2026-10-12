function processInput(rawData) {
    // Split the raw input string into an array of lines.
    var lineData = rawData.split('\n');

    // Parse the first line to extract initial configuration values.
    var firstLineParts = lineData[0].split(' ');

    // The first value from the first line (N in original) is assigned to a global variable.
    // This mirrors the original code's implicit global declaration.
    numItems = firstLineParts[0];

    // Convert the second value from the first line (X in original) to an integer.
    var remainingCapacity = parseInt(firstLineParts[1], 10);

    // Initialize an array to store the weights of individual items.
    var itemWeights = [];

    // Iterate through the subsequent lines to populate the item weights array.
    // The loop runs up to `lineData.length - 1` to exclude a potential empty last line.
    for (var idx = 0; idx < lineData.length - 1; idx++) {
        itemWeights.push(parseInt(lineData[idx + 1], 10));
    }

    // Initialize a counter for the total number of items that can be accommodated.
    var totalCount = 0;

    // Determine the smallest weight among all the items.
    // The '1e9' argument for 'apply' serves as the 'this' context, which is ignored by Math.min.
    var minWeight = Math.min.apply(1e9, itemWeights);

    // First, process each distinct item, deducting its weight and incrementing the count.
    for (var itemIdx = 0; itemIdx < itemWeights.length; itemIdx++) {
        remainingCapacity = remainingCapacity - itemWeights[itemIdx];
        totalCount++;
    }

    // Second, utilize any remaining capacity to add as many items of the minimum weight as possible.
    totalCount = totalCount + Math.floor(remainingCapacity / minWeight);

    // Output the final calculated total count to the standard console.
    console.log(totalCount);
}

// Read the entire content of the standard input file and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
