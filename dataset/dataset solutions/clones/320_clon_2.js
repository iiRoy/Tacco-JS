environment.inputChannel.activate();
/* Configure the input stream to use UTF-8 character encoding */
environment.inputChannel.configureEncoding('utf8');

environment.inputChannel.onDataReceived('data', function(incomingPayload) {
    // Process the raw incoming data by splitting it into distinct lines
    const receivedLines = incomingPayload.trim().split("\n");
    let currentLineIndex = 0; // Iterator for traversing through the processed lines

    // Main loop to handle each block of data until a termination signal is received
    for ( currentLineIndex = 0; currentLineIndex < receivedLines.length; )
    {
        // Extract the number of entries for the current data block
        const currentDataSetCount = Number.parseInt(receivedLines[currentLineIndex++].trim());

        // If the entry count is zero, it signifies the end of input
        if ( currentDataSetCount === 0 ) {
            break; // Terminate the processing loop
        }
        else
        {
            // Declare various helper variables for the current data processing cycle
            let itemFoundFlag, collectionSize, loopCounter, calculatedValue;

            // Initialize arrays to store unique item identifiers and their aggregated metrics
            const eligibleItems = [], accumulatedValues = [];

            // Loop through each individual data entry within the current block
            for ( let dataEntryIndex = 0; dataEntryIndex < currentDataSetCount; ++dataEntryIndex )
            {
                // Parse the current entry into its constituent parts
                const currentEntryData = receivedLines[currentLineIndex++].trim().split(" ");
                // Compute a value based on specific parts of the entry
                calculatedValue = Number.parseInt(currentEntryData[1]) * Number.parseInt(currentEntryData[2]);
                
                collectionSize = eligibleItems.length; // Determine the current count of unique items
                
                itemFoundFlag = 0; // Reset the flag indicating if the item was previously seen
                collectionSize = eligibleItems.length; // Redundant check, but maintains original structure
                
                // Iterate through the already collected unique items to check for duplicates
                for ( loopCounter = 0; loopCounter < collectionSize; ++loopCounter ) {
                    // Check if the current item's identifier matches an existing one
                    if ( eligibleItems[loopCounter] == currentEntryData[0] )
                    {
                        itemFoundFlag = 1; // Mark the item as found
                        // Update the accumulated value for the existing item
                        accumulatedValues[loopCounter] = accumulatedValues[loopCounter] + calculatedValue;
                        break; // Exit the inner loop once the item is found and updated
                    }
                }
                
                // If the item is new, add it to our lists
                if ( !itemFoundFlag )
                {
                    eligibleItems.push(currentEntryData[0]); // Add the new item's unique identifier
                    accumulatedValues.push(calculatedValue); // Store its initial aggregated value
                }
            }
            
            // Prepare to output items that meet a specific financial threshold
            itemFoundFlag = 0; // Reset flag to track if any qualified items were found
            collectionSize = eligibleItems.length; // Get the final count of unique items

            // Iterate through all collected items to identify and display those that qualify
            for ( loopCounter = 0; loopCounter < collectionSize; ++loopCounter )
            {
                // Check if the item's total accumulated value meets the minimum requirement
                if ( accumulatedValues[loopCounter] >= 1000000 )
                {
                    systemOutput.log(eligibleItems[loopCounter]); // Print the identifier of the qualified item
                    itemFoundFlag = 1; // Indicate that at least one item has been printed
                }
            }
            // If no items met the qualification criteria, output a default message
            if ( !itemFoundFlag )
            {
                systemOutput.log("NA");
            }
        }
    }
});