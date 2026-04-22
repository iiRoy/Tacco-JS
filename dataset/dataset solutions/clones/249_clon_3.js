const numericProcessor = {
    // This property stores the running total of all numbers encountered.
    currentSum: 0,
    
    /**
     * Extracts numeric sequences from a given text segment and calculates their sum.
     * @param {string} textSegment - The string from which to extract numbers.
     * @returns {number} The sum of all valid integers found in the segment.
     */
    processInputSegment: function(textSegment) {
        let segmentAccumulator = 0;
        
        // Define a regular expression to find one or more digits,
        // ensuring they are whole numbers by using word boundaries.
        const identifiedDigitStrings = textSegment.match(/\b\d+\b/g);

        // Before attempting to iterate, verify that the match operation
        // actually found some sequences and didn't return null.
        if (identifiedDigitStrings && identifiedDigitStrings.length > 0) {
            // Iterate through each string that was identified as a number.
            // Using forEach for a cleaner, functional iteration over the array.
            identifiedDigitStrings.forEach(numberCandidate => {
                // Convert the string to an integer, explicitly specifying base 10.
                const convertedInteger = parseInt(numberCandidate, 10);
                
                // Validate that the conversion resulted in a valid number (not NaN).
                if (!isNaN(convertedInteger)) {
                    segmentAccumulator += convertedInteger;
                } else {
                    // Optionally, log a warning for parsing failures if desired.
                    // console.warn(`Could not parse "${numberCandidate}" to an integer.`);
                }
            });
        }
        return segmentAccumulator;
    },

    /**
     * Adds a value to the cumulative sum maintained by the processor.
     * @param {number} valueToAdd - The numeric value to be accumulated.
     */
    accumulateValue: function(valueToAdd) {
        // Ensure the value being added is indeed a number to prevent type errors.
        if (typeof valueToAdd === 'number' && !isNaN(valueToAdd)) {
            this.currentSum += valueToAdd;
        } else {
            // console.error(`Attempted to accumulate a non-numeric value: ${valueToAdd}`);
        }
    },

    /**
     * Retrieves the final accumulated sum.
     * @returns {number} The total sum collected.
     */
    retrieveFinalSum: function() {
        return this.currentSum;
    }
};

// Activate the standard input stream to begin receiving data.
// This is crucial for event listeners to fire.
process.stdin.resume();

// Configure the encoding for incoming data chunks to UTF-8.
// This ensures proper interpretation of character data.
process.stdin.setEncoding('utf8');

// Establish an event handler for the 'data' event.
// This function executes whenever a chunk of data is received from stdin.
process.stdin.on('data', (incomingDataChunk) => {
    // Process the received data chunk to extract and sum numbers within it.
    const sumFromThisChunk = numericProcessor.processInputSegment(incomingDataChunk);
    
    // Add the sum calculated from the current chunk to the overall running total.
    numericProcessor.accumulateValue(sumFromThisChunk);
});

// Set up an event handler for the 'end' event.
// This function runs once the standard input stream has closed.
process.stdin.on('end', () => {
    // Fetch the final, consolidated sum from the processor.
    const finalCalculatedTotal = numericProcessor.retrieveFinalSum();
    
    // Display the ultimate result to the console, providing context.
    console.log(`Processing complete. The grand total of all numbers is: ${finalCalculatedTotal}`);
});