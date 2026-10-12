function processSalesData(inputContent) {
    const allInputLines = inputContent.split("\n");
    // The first line typically indicates the number of data sets,
    // but the original code's loop condition primarily relies on the total number of lines.
    // We will skip the first line and process the rest.

    let salesRecordMap = new Map(); // Stores sales data: Map<identifier: number, totalSalesAmount: number>

    // Iterate over each line of input, starting from the second line (index 1)
    allInputLines.slice(1).forEach(currentLineText => {
        // Parse the values in the current line, using parseInt to match original behavior
        const numericValues = currentLineText.split(" ").map(valueString => parseInt(valueString));

        // Determine if the line represents a report/flush event or a sales transaction
        if (numericValues.length === 1) {
            // This is a report/flush event: process accumulated sales and reset
            const highValueIdentifiers = [];
            // Iterate through the sales records to find those exceeding the threshold
            for (const [identifierKey, totalAmount] of salesRecordMap.entries()) {
                if (totalAmount >= 1000000) {
                    highValueIdentifiers.push(identifierKey);
                }
            }

            if (highValueIdentifiers.length === 0) {
                console.log("NA");
            } else {
                // Output each qualifying identifier, skipping any NaN values as per original logic
                highValueIdentifiers.forEach(idValue => {
                    if (!isNaN(idValue)) {
                        console.log(idValue);
                    }
                });
            }
            // Clear the sales records for the next data set
            salesRecordMap.clear();
        } else {
            // This is a sales transaction: update the sales record
            const [productIdentifier, itemQuantity, itemPrice] = numericValues;

            // Calculate the value of the current transaction
            const transactionTotal = itemQuantity * itemPrice;

            // Retrieve the current total for the product, defaulting to 0 if not found
            const existingProductTotal = salesRecordMap.get(productIdentifier) || 0;

            // Update the total sales for the product identifier
            salesRecordMap.set(productIdentifier, existingProductTotal + transactionTotal);
        }
    });
}

// Read input from stdin and pass it to the processing function
processSalesData(require('fs').readFileSync('/dev/stdin','utf8'));
