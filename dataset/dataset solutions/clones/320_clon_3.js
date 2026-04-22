process.stdin.resume();
process.stdin.setEncoding('utf8');

const AGGREGATION_THRESHOLD = 1_000_000; // Define a constant for the value threshold

process.stdin.on('data', (inputBuffer) => {
    // Split the entire input buffer into individual lines, removing leading/trailing whitespace
    const parsedInputLines = inputBuffer.trim().split('\n');
    let lineCursor = 0; // Initialize a cursor to track the current line being processed

    // Loop through the input lines as long as there are lines remaining
    while (lineCursor < parsedInputLines.length) {
        // Read the number of entries for the current block from the current line
        const numberOfEntriesInBlock = parseInt(parsedInputLines[lineCursor++].trim(), 10);

        // If the number of entries is 0, it signals the end of input processing
        if (numberOfEntriesInBlock === 0) {
            break; // Exit the main input processing loop
        }

        // Use a Map to store the total value aggregated for each distinct product identifier.
        // Keys are product names (strings), values are their accumulated totals (numbers).
        const productValueAccumulator = new Map();

        // Process each entry within the current data block
        for (let entryCounter = 0; entryCounter < numberOfEntriesInBlock; ++entryCounter) {
            const currentEntryLine = parsedInputLines[lineCursor++].trim();
            const entryComponents = currentEntryLine.split(' ');

            // Validate that the line has the expected number of components (product, quantity, price)
            if (entryComponents.length !== 3) {
                console.error(`Warning: Skipping malformed input line (expected 3 components): "${currentEntryLine}"`);
                continue; // Move to the next entry
            }

            const productName = entryComponents[0];
            const itemQuantity = parseInt(entryComponents[1], 10);
            const itemPrice = parseInt(entryComponents[2], 10);

            // Validate parsed numeric values
            if (isNaN(itemQuantity) || isNaN(itemPrice)) {
                console.error(`Warning: Skipping line with non-numeric quantity or price: "${currentEntryLine}"`);
                continue; // Move to the next entry
            }

            // Calculate the value for the current item
            const calculatedItemValue = itemQuantity * itemPrice;

            // Update the total accumulated value for the product in the map.
            // If the product is new, initialize its value; otherwise, add to its existing total.
            productValueAccumulator.set(productName, (productValueAccumulator.get(productName) || 0) + calculatedItemValue);
        }

        let anyProductExceededThreshold = false;
        const eligibleProductNames = []; // Collect names of products that meet the threshold

        // Iterate through all aggregated products to check against the threshold
        for (const [productIdentifier, totalAccumulatedValue] of productValueAccumulator.entries()) {
            if (totalAccumulatedValue >= AGGREGATION_THRESHOLD) {
                eligibleProductNames.push(productIdentifier);
                anyProductExceededThreshold = true;
            }
        }

        // Output the results for the current block
        if (anyProductExceededThreshold) {
            // Sort the eligible product names alphabetically before printing for consistent output
            eligibleProductNames.sort().forEach(name => console.log(name));
        } else {
            console.log('NA'); // No products in this block met the specified value threshold
        }
    }
});