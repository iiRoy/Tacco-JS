function processInputData(rawDataString) {
    // Split the raw input string by space to get an array of string numbers.
    const stringNumbersArray = rawDataString.split(" ");

    // Parse the individual integer values from the array.
    // Using radix 10 explicitly for parseInt is a good practice.
    const totalCapacityValue = parseInt(stringNumbersArray[0], 10);
    const firstItemQuantity = parseInt(stringNumbersArray[1], 10);
    const secondItemQuantity = parseInt(stringNumbersArray[2], 10);

    // Calculate the combined quantity of both types of items.
    const combinedItemsSum = firstItemQuantity + secondItemQuantity;

    // Determine the number of items that cannot be accommodated due to capacity limits.
    // This logic is equivalent to Math.max(0, combinedItemsSum - totalCapacityValue).
    let excessItemsCount;
    const availableSpace = totalCapacityValue - combinedItemsSum;

    if (availableSpace >= 0) {
        // If there's enough or exactly enough space, no items are in excess.
        excessItemsCount = 0;
    } else {
        // If space is insufficient, the excess is the absolute value of the negative available space.
        excessItemsCount = Math.abs(availableSpace);
    }

    // Calculate the minimum quantity between the two item types.
    const minimumItemQuantity = Math.min(firstItemQuantity, secondItemQuantity);

    // Output the two calculated values in the specified format.
    console.log('%d %d', minimumItemQuantity, excessItemsCount);
}

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
