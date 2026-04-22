process.stdin.on("data", function(incomingBuffer) {
    // This section processes incoming raw data from standard input.

    // Convert the raw buffer to a string, remove leading/trailing whitespace,
    // and then split it into an array of individual instruction lines.
    const fullInputString = String(incomingBuffer).trim();
    const instructionLines = fullInputString.split("\n");

    // Initialize core data structures:
    // 'cargoPiles' will serve as our collection of stacks, indexed from 1.
    // 'extractedItems' will temporarily hold items that are "popped" for eventual output.
    const cargoPiles = [];
    const extractedItems = [];

    // The very first line of input specifies the total number of cargo piles to initialize.
    const initialPilesCountString = instructionLines.shift(); // Remove and get the first line
    const totalPilesToCreate = parseInt(initialPilesCountString, 10); // Parse as an integer, base 10.

    // Basic validation: ensure the parsed count is a non-negative number.
    // If not valid, we'll default to 0 piles to prevent errors, or could throw.
    const actualPileCount = (isNaN(totalPilesToCreate) || totalPilesToCreate < 0) ? 0 : totalPilesToCreate;

    // Set up the array of arrays (stacks). We use 1-based indexing for piles,
    // so we initialize 'actualPileCount + 1' slots, with the 0th index remaining unused.
    for (let currentPileNumber = 0; currentPileNumber <= actualPileCount; currentPileNumber++) {
        cargoPiles[currentPileNumber] = []; // Each slot holds an empty array representing a stack.
    }

    // Iterate through each remaining line, interpreting it as an instruction.
    // A `for...of` loop is used for clear iteration and `break` functionality.
    for (const currentCommandString of instructionLines) {
        const cleanedCommand = currentCommandString.trim(); // Clean whitespace from the command.

        // Check for the "quit" instruction to cease further processing.
        if (cleanedCommand === "quit") {
            break; // Terminate the loop.
        }

        // Parse the command string into its constituent parts (verb and arguments).
        // For example, "push 1 A" becomes ["push", "1", "A"].
        const commandSegments = cleanedCommand.split(' ');
        const commandVerb = commandSegments[0]; // The first part is the action.

        // Utilize a switch statement for clear and distinct handling of different commands.
        switch (commandVerb) {
            case "push":
                // Expected format: "push <pileIndex> <item>"
                if (commandSegments.length < 3) continue; // Skip malformed commands.

                const destinationPileId = parseInt(commandSegments[1], 10);
                const itemToLoad = commandSegments[2];

                // Validate the pile index to ensure it's within the valid range.
                if (isNaN(destinationPileId) || destinationPileId < 1 || destinationPileId > actualPileCount) {
                    continue; // Skip if the pile ID is invalid.
                }

                // Add the item to the specified cargo pile.
                cargoPiles[destinationPileId].push(itemToLoad);
                break;

            case "move":
                // Expected format: "move <sourcePileIndex> <destinationPileIndex>"
                if (commandSegments.length < 3) continue; // Skip malformed commands.

                const sourcePileId = parseInt(commandSegments[1], 10);
                const targetPileId = parseInt(commandSegments[2], 10);

                // Validate both source and target pile indices.
                if (isNaN(sourcePileId) || sourcePileId < 1 || sourcePileId > actualPileCount ||
                    isNaN(targetPileId) || targetPileId < 1 || targetPileId > actualPileCount) {
                    continue; // Skip if any pile ID is invalid.
                }

                // Ensure the source pile is not empty before attempting to move an item.
                if (cargoPiles[sourcePileId].length === 0) {
                    continue; // Cannot move from an empty pile.
                }

                // Pop an item from the source pile and push it onto the target pile.
                const transferredItem = cargoPiles[sourcePileId].pop();
                cargoPiles[targetPileId].push(transferredItem);
                break;

            case "pop":
                // Expected format: "pop <pileIndex>"
                if (commandSegments.length < 2) continue; // Skip malformed commands.

                const pileIdToExtractFrom = parseInt(commandSegments[1], 10);

                // Validate the pile index.
                if (isNaN(pileIdToExtractFrom) || pileIdToExtractFrom < 1 || pileIdToExtractFrom > actualPileCount) {
                    continue; // Skip if the pile ID is invalid.
                }

                // Ensure the pile is not empty before attempting to pop an item.
                if (cargoPiles[pileIdToExtractFrom].length === 0) {
                    continue; // Cannot pop from an empty pile.
                }

                // Pop an item and store it in our temporary collection for output.
                const retrievedItem = cargoPiles[pileIdToExtractFrom].pop();
                extractedItems.push(retrievedItem);
                break;

            default:
                // If an unrecognized command verb is encountered, simply skip it.
                break;
        }
    }

    // After processing all instructions, output each collected item.
    // A `for...of` loop is used for iterating through the final results.
    for (const finalResultItem of extractedItems) {
        console.log(finalResultItem);
    }

}).resume(); // Ensure the standard input stream is set to flowing mode to receive data.