const ProcessStringQueries = (rawInputData) => {
    // All lines from the raw input are split by the newline character.
    const inputLines = rawInputData.split('\n');

    // The very first line of the input serves as the initial string state.
    let currentStringValue = inputLines[0];

    // The subsequent lines contain the commands for string manipulation.
    // We create a new array containing only these command lines.
    const commandLines = inputLines.slice(1);

    // This variable acts as a "direction multiplier" or "orientation flag" for string operations.
    // If `1`, string operations proceed in a "normal" fashion internally, but the final output
    // will need to be reversed.
    // If `-1`, string operations proceed in a "reversed" fashion internally, and the final output
    // can be displayed as-is.
    let stringOrientationFactor = 1;

    // Loop through each command line to apply the specified operations.
    for (let queryIndex = 0; queryIndex < commandLines.length; ++queryIndex) {
        const currentCommandInput = commandLines[queryIndex];

        // Skip any potentially empty lines, which can occur with trailing newlines in input.
        if (currentCommandInput.trim() === '') {
            continue;
        }

        // Each command line is split into parts based on spaces.
        const commandParts = currentCommandInput.split(' ');

        // The first part of the command determines its type: '1' for an orientation flip,
        // or '2' for a string modification operation.
        const isOrientationFlipCommand = (commandParts[0] === '1');

        if (isOrientationFlipCommand) {
            // If it's an orientation flip command, simply reverse the current orientation factor.
            // This toggles between 1 and -1.
            stringOrientationFactor *= -1;
        } else {
            // This block handles string modification commands.
            // A basic check to ensure the command has enough parts (e.g., "2 1 X").
            if (commandParts.length < 3) {
                // If a command is malformed, we skip it. In a robust system, this might log an error.
                continue;
            }

            // Convert the second part of the command to an integer to get the operation type.
            // Type 1 typically means "append to end" and Type 2 means "prepend to beginning"
            // under a normal orientation factor.
            const operationTypeIdentifier = parseInt(commandParts[1], 10);
            // The third part is the string fragment that needs to be added.
            const fragmentToManipulate = commandParts[2];

            // A boolean flag to determine if the fragment should be prepended to the string.
            let shouldPerformPrependOperation;

            // The logic for prepending or appending depends on both the current string orientation
            // and the specific operation type identifier.
            //
            // shouldPerformPrependOperation is true if:
            //   (Orientation is 'normal' (1) AND operation is 'prepend' (2))
            //   OR
            //   (Orientation is 'reversed' (-1) AND operation is 'append' (1))
            shouldPerformPrependOperation = (
                (stringOrientationFactor === 1 && operationTypeIdentifier === 2) ||
                (stringOrientationFactor === -1 && operationTypeIdentifier === 1)
            );

            if (shouldPerformPrependOperation) {
                // Prepend the fragment to the current string value.
                currentStringValue = fragmentToManipulate + currentStringValue;
            } else {
                // Append the fragment to the current string value.
                currentStringValue = currentStringValue + fragmentToManipulate;
            }
        }
    }

    // After all commands have been processed, we determine the final output.
    let finalProcessedString;

    // If the string orientation factor is 1, it implies that string operations were
    // effectively performed in a "normal" direction, but the problem's final output
    // expectation for this state requires reversing the accumulated string.
    if (stringOrientationFactor === 1) {
        finalProcessedString = currentStringValue.split('').reverse().join('');
    } else {
        // If the string orientation factor is -1, operations were performed in a "reversed"
        // manner, meaning the string is already in its correct final orientation.
        finalProcessedString = currentStringValue;
    }

    // Output the final computed string to the console.
    console.log(finalProcessedString);
};

// This helper function reads the entire standard input.
// It uses Node.js's 'fs' module to read from '/dev/stdin', which is standard
// for competitive programming environments. The input is decoded as UTF-8 and
// any leading/trailing whitespace is removed.
const retrieveStandardInput = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
};

// Execute the main processing function by passing the retrieved standard input.
ProcessStringQueries(retrieveStandardInput());