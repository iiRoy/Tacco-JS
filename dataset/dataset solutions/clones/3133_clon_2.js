function processInput(rawData) {
    // Declare variables for loop indices, the main data structure, and the accumulated total.
    let idx1, idx2;
    let dataMatrix;
    let totalValue = 0;

    // Parse the first line of the raw input to extract configuration parameters.
    // The first parameter typically indicates the number of items, and the second, a capacity.
    const params = rawData.split('\n')[0].split(' ');

    // Initialize an array to store item data. The initial size is based on the second parameter.
    dataMatrix = new Array(params[1]);

    // Populate the data matrix by parsing subsequent lines of the input.
    // Each line represents an item, typically with a value and a quantity.
    for (idx1 = 0; idx1 < params[0]; idx1++) {
        dataMatrix[idx1] = rawData.split('\n')[idx1 + 1].split(' ');
    }

    // Sort the data matrix. The sorting criterion is the first element of each inner array,
    // which usually represents the item's value, in ascending order.
    dataMatrix.sort(function(itemA, itemB) {
        return (itemA[0] - itemB[0]);
    });

    // Reset the loop indices for the main processing logic.
    idx1 = 0;
    idx2 = 0;

    // Begin the main loop to accumulate the total value.
    // This loop continues until the capacity (second parameter) is reached.
    while (idx2 < params[1]) {
        // Add the numerical value of the current item to the running total.
        totalValue += Number(dataMatrix[idx1][0]);
        // Decrement the quantity of the current item.
        dataMatrix[idx1][1]--;
        // Increment the counter for the items processed or capacity utilized.
        idx2++;
        // If the quantity of the current item drops to zero or below,
        // move to the next distinct item type.
        if (dataMatrix[idx1][1] <= 0) {
            idx1++;
        }
    }

    // Output the final calculated total value to the console.
    console.log(totalValue);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
