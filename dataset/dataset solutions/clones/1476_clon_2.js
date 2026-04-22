// This module processes incoming data streams from standard input.

process.stdin.on("data", function (incomingPayload) {
    // Initialize primary data structures for processing.
    // 'containerUnits' will hold multiple stacks/queues.
    // 'finalResults' will store processed outputs.
    let containerUnits = [], finalResults = [];

    // Convert the incoming buffer to a string, clean it, and split into individual instruction lines.
    const instructionLines = (incomingPayload + "").trim().split("\n");

    // Extract the first line to determine the total number of containers required.
    const stackCount = +instructionLines.shift();

    // Initialize the specified number of containers, starting from index 1.
    for ( let currentSlotIndex = 0; currentSlotIndex < stackCount; currentSlotIndex++ ) {
        containerUnits[currentSlotIndex + 1] = [];
    }

    // Iterate through each instruction line until a 'quit' command is encountered.
    instructionLines.some( function (currentInstruction) {
        // If the instruction is to quit, stop processing.
        if ( currentInstruction === "quit" ) {
            return 1; // Return true to stop the 'some' loop.
        }

        // Check for "push" operation (implied by "pu" substring).
        if ( ~currentInstruction.indexOf("pu") ) {
            // Push an item onto a specific container.
            // Indices 5 and 7 are hardcoded based on expected input format.
            containerUnits[+currentInstruction[5]].push(currentInstruction[7]);
        }
        // Check for "move" operation (implied by "mo" substring).
        else if ( ~currentInstruction.indexOf("mo") ) {
            // Move an item from one container to another.
            // Pop from source container (index 5) and push to destination container (index 7).
            containerUnits[+currentInstruction[7]].push(containerUnits[+currentInstruction[5]].pop());
        }
        // Default operation: pop an item and store it in the final results buffer.
        else {
            // Pop from container at index 4 and add to final results.
            finalResults.push(containerUnits[+currentInstruction[4]].pop());
        }
    });

    // Output all collected results to the console.
    finalResults.forEach( function (outputElement) {
        console.log(outputElement);
    });
}).resume(); // Keep the standard input stream open to receive data.