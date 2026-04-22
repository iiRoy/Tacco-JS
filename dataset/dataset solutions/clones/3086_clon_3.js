let boardDimension = 0;

/**
 * Executes the main logic of the program based on the provided input string.
 * This function processes initial board configuration and subsequent movement queries.
 * @param {string} programInput - The raw input string containing configuration and queries.
 */
function ProcessGameScenario(programInput) {
    // Validate the overall input to prevent processing empty or malformed data.
    if (!programInput || programInput.trim().length === 0) {
        console.error("Error: The provided program input is empty or contains only whitespace. Cannot proceed.");
        return;
    }

    const inputLines = programInput.split('\n');

    // Ensure there are enough lines for basic configuration (board size and initial layout).
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines for configuration.");
        return;
    }

    const configurationParameters = inputLines[0].split(' ');
    // Parse the board dimension from the first parameter.
    boardDimension = Number(configurationParameters[0]);

    // Validate the parsed board dimension. It must be a positive integer.
    if (isNaN(boardDimension) || boardDimension <= 0) {
        console.error(`Error: Invalid board dimension specified: '${configurationParameters[0]}'. Must be a positive number.`);
        return;
    }

    // Initialize a Map to store character positions for quick lookup.
    // This maps a character (e.g., 'A', 'B') to an array of indices where it's located.
    const charPositionMap = new Map();
    // Initialize an array to store the count of items at each position on the board.
    // All positions start with zero items.
    const itemCounts = Array(boardDimension).fill(0);

    const initialTileConfiguration = inputLines[1];
    // Validate the initial tile configuration string.
    if (!initialTileConfiguration || initialTileConfiguration.length === 0) {
        console.error("Error: The initial tile configuration string on line 2 is empty. Cannot set up board.");
        return;
    }

    // Populate initial item counts and the character position map based on the second input line.
    for (let charIndex = 0; charIndex < initialTileConfiguration.length; charIndex++) {
        const currentSymbol = initialTileConfiguration[charIndex];

        // If the initial configuration string is longer than the specified board dimension,
        // we log a warning and stop processing further characters to respect the board size.
        if (charIndex >= boardDimension) {
            console.warn(`Warning: Initial configuration string exceeds board dimension (${boardDimension}). Ignoring characters beyond this limit.`);
            break;
        }

        // Each character in the initial configuration represents one item at that position.
        itemCounts[charIndex] = 1;

        // Retrieve or create the list of positions for the current symbol.
        let positions = charPositionMap.get(currentSymbol);
        if (!positions) {
            positions = [];
            charPositionMap.set(currentSymbol, positions);
        }
        positions.push(charIndex);
    }

    // Define constants for movement directions for better readability and maintainability.
    const DirectionConstants = Object.freeze({
        RIGHT: "R",
        LEFT: "L"
    });

    // Process all subsequent lines as movement queries.
    for (let queryLineIndex = 2; queryLineIndex < inputLines.length; queryLineIndex++) {
        const currentQueryInstruction = inputLines[queryLineIndex];

        // Skip empty or purely whitespace query lines.
        if (!currentQueryInstruction || currentQueryInstruction.trim().length === 0) {
            continue;
        }

        const [targetCharacter, movementDirection] = currentQueryInstruction.split(' ');

        // Validate the format of the query instruction.
        if (!targetCharacter || !movementDirection) {
            console.warn(`Warning: Malformed query instruction on line ${queryLineIndex + 1}: '${currentQueryInstruction}'. Skipping this query.`);
            continue;
        }

        // Retrieve the list of indices where the target character is currently located.
        const affectedIndices = charPositionMap.get(targetCharacter);

        // If there are no items of this character type (or they've all moved off-board), skip this query.
        if (!affectedIndices || affectedIndices.length === 0) {
            continue;
        }

        let displacementValue;
        if (movementDirection === DirectionConstants.RIGHT) {
            displacementValue = 1;
            // When moving right, iterate from the highest index to lowest to prevent
            // items from being moved multiple times if they land in a position
            // that is subsequently processed in the same query.
            for (let k = affectedIndices.length - 1; k >= 0; k--) {
                relocateItems(itemCounts, affectedIndices[k], displacementValue);
            }
        } else if (movementDirection === DirectionConstants.LEFT) {
            displacementValue = -1;
            // When moving left, iterate from the lowest index to highest.
            for (let k = 0; k < affectedIndices.length; k++) {
                relocateItems(itemCounts, affectedIndices[k], displacementValue);
            }
        } else {
            // Handle unknown movement directions.
            console.warn(`Warning: Unknown movement direction '${movementDirection}' for character '${targetCharacter}'. Skipping this query.`);
            continue;
        }
    }

    // Calculate the final total count of items remaining on the board.
    let finalTotalCount = 0;
    // Using Array.prototype.reduce for a concise sum calculation.
    finalTotalCount = itemCounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Output the final count to the console.
    console.log(finalTotalCount);
}

/**
 * Relocates items from a source index to a destination index within the itemCounts array.
 * Items moved off the board (destination is out of bounds) are effectively removed.
 * @param {number[]} itemCounts - The array representing counts of items at each position.
 * @param {number} sourceIndex - The current index of the items to be moved.
 * @param {number} displacement - The amount and direction of movement (-1 for left, 1 for right).
 */
function relocateItems(itemCounts, sourceIndex, displacement) {
    // Basic validation for internal function parameters.
    // For a Type III clone, adding such checks enhances robustness.
    if (!Array.isArray(itemCounts) || sourceIndex < 0 || sourceIndex >= boardDimension || !Number.isInteger(displacement)) {
        // console.error("Internal Error: Invalid parameters passed to relocateItems. Skipping operation.");
        return;
    }

    const destinationIndex = sourceIndex + displacement;
    const itemQuantity = itemCounts[sourceIndex];

    // Clear the source position immediately. The items are "picked up".
    itemCounts[sourceIndex] = 0;

    // Check if the destination is within the valid bounds of the board.
    if (destinationIndex < 0 || destinationIndex >= boardDimension) {
        // If the items move off the board, they are simply removed from consideration.
        return;
    }

    // Add the quantity of items to the destination position.
    itemCounts[destinationIndex] += itemQuantity;
}

// --- Program Entry Point ---
// This block handles reading input from stdin and initiating the main processing function.
try {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessGameScenario(rawInputData);
} catch (error) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error("An unhandled error occurred during input reading or scenario processing:", error.message);
    // In a production script, you might want to exit with a non-zero status code here.
    // process.exit(1);
}