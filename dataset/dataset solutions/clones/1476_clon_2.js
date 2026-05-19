process.stdin.on("data", function(inputDataBuffer) {
    // Initialize data structures for stacks and results
    var stackCollection = [];
    var resultItems = [];

    // Convert input buffer to string, trim, and split into individual lines
    var processedLines = (inputDataBuffer + "").trim().split("\n");

    // The first line indicates the number of stacks to prepare
    var initialStackCount = +processedLines.shift();

    // Populate the stack collection with empty arrays, using 1-based indexing
    for (var stackIndex = 0; stackIndex < initialStackCount; stackIndex++) {
        stackCollection[stackIndex + 1] = [];
    }

    // Process each command line until "quit" is encountered
    processedLines.some(function(currentCommand) {
        // If the command is "quit", stop further processing
        if (currentCommand === "quit") {
            return 1; // Signal to stop iteration
        }

        // Check for "push" operation
        if (~currentCommand.indexOf("pu")) {
            // Extract stack identifier and item to push
            stackCollection[+currentCommand[5]].push(currentCommand[7]);
        }
        // Check for "move" operation
        else if (~currentCommand.indexOf("mo")) {
            // Pop from source stack and push to destination stack
            stackCollection[+currentCommand[7]].push(stackCollection[+currentCommand[5]].pop());
        }
        // Default to "pop" operation
        else {
            // Pop from the specified stack and store the item in the results buffer
            resultItems.push(stackCollection[+currentCommand[4]].pop());
        }
        return 0; // Continue iteration
    });

    // Output all collected result items
    resultItems.forEach(function(outputValue) {
        console.log(outputValue);
    });
}).resume();
