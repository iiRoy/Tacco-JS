process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(rawData) {
    // Split the raw input into an array of individual lines, after trimming any leading/trailing whitespace.
    var inputLines = rawData.trim().split("\n");
    
    // Initialize an index to keep track of the current line being processed from the inputLines array.
    var lineIndex = 0;
    
    // Begin an infinite loop to process multiple test cases or blocks of data.
    while (true) {
        // Parse the first number on the current line, which represents the number of entries (N) for the current block.
        var numEntries = parseInt(inputLines[lineIndex].trim());
        
        // Check if the number of entries is zero, which signals the end of input.
        if (numEntries === 0) {
            break; // Exit the main processing loop.
        } else {
            // Declare several variables that will be used within this data block.
            var itemFound, currentLength, idx, calculatedValue, entityId;
            
            // Initialize two arrays: one to store unique entity identifiers and another for their corresponding total amounts.
            var uniqueEntities = [], totalAmounts = [];
            
            // Loop through each of the 'numEntries' data entries in the current block.
            for (var entryCounter = 0; entryCounter < numEntries; ++entryCounter) {
                // Get the current data line, increment the line index, trim whitespace, and split it by spaces.
                var dataParts = inputLines[lineIndex++].trim().split(" ");
                
                // Calculate a value by multiplying the second and third parsed integers from the current data line.
                calculatedValue = parseInt(dataParts[1]) * parseInt(dataParts[2]);
                
                // Reset a flag to indicate whether the current entity has been found in our tracking arrays.
                itemFound = 0;
                // Get the current number of unique entities being tracked.
                currentLength = uniqueEntities.length;
                // Parse the entity identifier from the first part of the data line.
                entityId = parseInt(dataParts[0]);
                
                // Iterate through the list of already recorded unique entities.
                for (idx = 0; idx < currentLength; ++idx) {
                    // If the current entity's ID matches an ID already in our uniqueEntities array.
                    if (uniqueEntities[idx] === entityId) {
                        itemFound = 1; // Set the flag to true (1) as the entity is found.
                        // Add the newly calculated value to the existing total amount for this entity.
                        totalAmounts[idx] = totalAmounts[idx] + calculatedValue;
                        break; // Exit this inner loop since the entity has been processed.
                    }
                }
                
                // If the entity was not found in the existing list (itemFound is still 0).
                if (itemFound === 0) {
                    // Add the new entity's ID to the uniqueEntities array.
                    uniqueEntities.push(entityId);
                    // Add its calculated value to the totalAmounts array.
                    totalAmounts.push(calculatedValue);
                }
            }
            
            // Reset the 'itemFound' flag to check if any entities qualify based on their total amount.
            itemFound = 0;
            // Get the final count of unique entities processed in this block.
            currentLength = uniqueEntities.length;
            
            // Iterate through all unique entities to check their accumulated total amounts.
            for (idx = 0; idx < currentLength; ++idx) {
                // If an entity's total amount is greater than or equal to 1,000,000.
                if (totalAmounts[idx] >= 1000000) {
                    // Print the ID of this qualifying entity to the console.
                    console.log(uniqueEntities[idx]);
                    itemFound = 1; // Set the flag to true (1) as at least one qualifying entity was found.
                }
            }
            
            // If no qualifying entities were found in this entire block of data.
            if (itemFound === 0) {
                console.log("NA"); // Print "NA" to indicate no qualifying entities.
            }
        }
    }
});
