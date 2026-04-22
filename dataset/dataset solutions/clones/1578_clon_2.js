process
    .stdin
    .resume();

process
    .stdin
    .setEncoding(
        'utf8'
    );

// A dynamic array structure to accumulate individual input segments
var inputSegments = [];

// Instantiate a line-by-line input processing utility
var streamProcessor = require('readline').createInterface({
    input : process.stdin,  // Designate standard input as the source
    output: process.stdout  // Designate standard output for potential writes (not used here)
});

// Attach an event handler for every new line of data received
streamProcessor
    .on(
        'line',
        (dataChunk) => {
            // Add the current input data segment to our collection
            inputSegments
                .push(
                    dataChunk
                );
        }
    );

// Register an event handler to execute once the input stream concludes
streamProcessor
    .on(
        'close',
        () => {
            // Extract and parse the total quantity of items from the first input segment
            var quantity = parseInt(inputSegments[0]);

            // Initialize a variable to store the cumulative difference calculation
            var aggregatedDifference = 0;
            // Initialize a variable to track the highest numeric value encountered during iteration
            var currentHighValue = 0;

            // Commence an iterative process for the specified number of items
            for (
                var loopCounter = 0;
                loopCounter < quantity;
                loopCounter++
            ) {
                // Parse the current item's numeric value from the second input segment,
                // splitting it by spaces and accessing the element at the current index
                var processedItem = parseInt(
                    inputSegments[1]
                        .split(' ')[loopCounter]
                );
                
                // Update the current highest value if the newly processed item surpasses it
                currentHighValue = Math.max(
                    currentHighValue,
                    processedItem
                );
                
                // Accumulate the difference between the current highest value and the processed item
                aggregatedDifference += currentHighValue - processedItem;
            }
            
            // Display the final computed aggregated difference to the standard output
            console.log(aggregatedDifference);
        }
    );