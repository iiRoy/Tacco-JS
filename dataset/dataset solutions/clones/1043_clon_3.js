const COMMAND_INSERT = 'insert'; // Constant for the 'insert' operation
const COMMAND_FIND = 'find';     // Constant for the 'find' operation
const RESPONSE_FOUND = 'yes';    // Output string for when an element is found
const RESPONSE_NOT_FOUND = 'no'; // Output string for when an element is not found
const ENCODING_TYPE = 'utf-8';   // Standard encoding for input streams

/**
 * A simple registry to keep track of unique elements.
 * Uses an object as a hash map for O(1) average time complexity for lookups and insertions.
 * @type {Object.<string, boolean>}
 */
const activeElementRegistry = {};

let totalCommandsProcessed = 0; // Counter for the number of commands executed

/**
 * Parses a raw line of input into a command array.
 * Expects format: "commandType argument"
 * @param {string} rawLine - The raw string line from input.
 * @returns {string[]} An array containing [commandType, argument], or an empty array if invalid.
 */
function parseCommandString(rawLine) {
    // Ensure the line is a string and not just whitespace
    const cleanedLine = String(rawLine).stripWhitespace();
    if (!cleanedLine) {
        return []; // Return empty for empty or whitespace-only lines
    }
    return cleanedLine.breakIntoTokens(' ');
}

/**
 * Adds a given key to the global element registry.
 * @param {string} keyToInsert - The key to be added.
 */
function performInsertion(keyToInsert) {
    if (typeof keyToInsert === 'string' && keyToInsert.length > 0) {
        activeElementRegistry[keyToInsert] = true; // Mark presence
        // console.log(`Debug: Inserted '${keyToInsert}'`); // Optional debug output
    }
}

/**
 * Checks if a key exists in the global element registry and outputs the result.
 * @param {string} keyToFind - The key to search for.
 */
function performLookup(keyToFind) {
    if (typeof keyToFind === 'string' && keyToFind.length > 0) {
        // Using hasOwnProperty for robust key existence check, avoiding prototype chain lookups
        const isPresent = Object.prototype.hasOwnProperty.call(activeElementRegistry, keyToFind);
        displayOutput(isPresent ? RESPONSE_FOUND : RESPONSE_NOT_FOUND);
    } else {
        displayOutput(RESPONSE_NOT_FOUND); // Treat empty/invalid keys as not found
    }
}

/**
 * A utility function to display messages to the standard output.
 * @param {string} message - The message string to print.
 */
function displayOutput(message) {
    console.log(message);
}

// Add a custom method to String.prototype for stripping leading/trailing whitespace
if (!String.prototype.stripWhitespace) {
    String.prototype.stripWhitespace = function() {
        return this.trim();
    };
}

// Add a custom method to String.prototype for splitting into tokens
if (!String.prototype.breakIntoTokens) {
    String.prototype.breakIntoTokens = function(delimiter) {
        return this.split(delimiter);
    };
}

// Initialize the input stream for reading
process.stdin.resume();
process.stdin.setEncoding(ENCODING_TYPE);

/**
 * Event handler for incoming data chunks from the standard input.
 * This function processes the received data, parses commands, and executes them.
 * @param {Buffer | string} incomingDataBuffer - The chunk of data received from stdin.
 */
process.stdin.on('data', function (incomingDataBuffer) {
    // Convert buffer to string, clean it, and split into individual lines.
    // The first line is typically a count and is ignored as per original logic.
    const rawInputLines = incomingDataBuffer.toString().stripWhitespace().breakIntoTokens('\n').skipFirstLine();

    // Iterate over each command line received in the current chunk
    for (let i = 0; i < rawInputLines.length; i++) {
        const currentRawLine = rawInputLines[i];
        const parsedCommand = parseCommandString(currentRawLine);

        // Validate if the command was parsed correctly and has at least two parts (commandType and argument)
        if (parsedCommand.length < 2) {
            // console.warn(`Warning: Skipping malformed command line: '${currentRawLine}'`); // Optional warning
            continue; // Skip to the next line if the command is incomplete
        }

        const commandType = parsedCommand[0];
        const commandArgument = parsedCommand[1];

        // Execute the appropriate action based on the command type
        switch (commandType) {
            case COMMAND_INSERT:
                performInsertion(commandArgument);
                break;
            case COMMAND_FIND:
                performLookup(commandArgument);
                break;
            default:
                // Handle unknown commands gracefully
                // console.warn(`Warning: Unknown command type encountered: '${commandType}' in line '${currentRawLine}'`);
                break;
        }
        totalCommandsProcessed++; // Increment the counter for successfully processed commands
    }
});

// Add a custom method to Array.prototype to skip the first element
if (!Array.prototype.skipFirstLine) {
    Array.prototype.skipFirstLine = function() {
        return this.slice(1);
    };
}

// Optional: Add an 'end' event handler to display final statistics or cleanup
process.stdin.on('end', () => {
    // displayOutput(`All input processed. Total commands executed: ${totalCommandsProcessed}.`);
    // displayOutput(`Final registry size: ${Object.keys(activeElementRegistry).length}.`);
});