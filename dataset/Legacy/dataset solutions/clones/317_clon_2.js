function processInput(rawData) {
    // Divide the incoming raw string into an array of separate lines
    const inputLines = rawData.split("\n");

    // Extract the first line and parse it as an integer to get the count of data sets
    let remainingSets = parseInt(inputLines[0], 10);

    // Initialize a line counter, starting from the second line of input
    let linePointer = 0x1; // Using a hexadecimal literal for the number 1

    // An array to hold the aggregated sales information for the current processing block
    let accumulatedSales = [];

    // Iterate through the input lines as long as there are lines available and data sets to process
    while (linePointer < inputLines.length && remainingSets > 0x0) { // Using a hexadecimal literal for the number 0
        // Process the current line: split it by spaces and convert each part to an integer
        const currentEntry = inputLines[linePointer].split(" ").map(function(strVal) {
            return parseInt(strVal, 10); // Explicitly specifying base 10 for parsing
        });

        // Determine if the current entry signifies the end of a data set (a single number)
        if (currentEntry.length === 0x1) { // Using a hexadecimal literal for the number 1
            // If it's a separator, filter the accumulated sales for records with high total revenue
            const highValueIds = accumulatedSales.reduce(function(idCollector, saleRecord) {
                // Check if the total revenue for this record meets the specified threshold
                if (saleRecord.totalRevenue >= 1_000_000) { // Using a numeric separator for readability
                    idCollector.push(saleRecord.identifier); // Add the record's identifier to the collection
                }
                return idCollector; // Return the array of collected identifiers
            }, []); // Start with an empty array for collecting identifiers

            // Output the identifiers of high-value sales, or "NA" if no such sales exist
            if (highValueIds.length <= 0x0) { // Using a hexadecimal literal for the number 0
                console.log("NA"); // Print "NA" if no high-value sales were found
            } else {
                // Loop through the array of high-value identifiers
                for (let idx = 0x0; idx < highValueIds.length; idx++) { // Using a hexadecimal literal for the number 0
                    // Only print the identifier if it is a valid number
                    if (!isNaN(highValueIds[idx])) {
                        console.log(highValueIds[idx]);
                    }
                }
            }
            // Clear the accumulated sales array to prepare for the next data set
            accumulatedSales = [];
            // Decrement the counter for remaining data sets
            remainingSets--;
        } else {
            // If the entry contains multiple numbers, it's a sales transaction record
            let entryIndex = 0x0; // Initialize an index to search for an existing record
            // Search for an existing sales record with the same identifier
            for (; entryIndex < accumulatedSales.length; entryIndex++) {
                if (accumulatedSales[entryIndex].identifier === currentEntry[0x0]) { // Using a hexadecimal literal for the number 0
                    break; // Found a matching identifier, exit the loop
                }
            }

            // Retrieve the current total revenue for this identifier, defaulting to 0 if it's a new record
            const existingRevenue = (accumulatedSales[entryIndex] || { totalRevenue: 0x0 }).totalRevenue; // Using a hexadecimal literal for the number 0

            // Update or create the sales record with the newly calculated total revenue
            accumulatedSales[entryIndex] = {
                identifier: currentEntry[0x0], // The first element is the unique identifier
                totalRevenue: existingRevenue + (currentEntry[0x1] * currentEntry[0x2]) // Calculate new total revenue from quantity and price
            };
        }
        // Advance the line pointer to the next line in the input
        linePointer++;
    }
}

// Read the entire content from standard input as a UTF-8 string and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
