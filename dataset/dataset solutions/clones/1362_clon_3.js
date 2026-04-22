// This script's purpose is to ingest a single line of numerical input from the standard input stream,
// specifically expecting three integer values separated by spaces. It then processes these numbers
// by sorting them in ascending order and subsequently outputs the sorted sequence back to
// the standard output, maintaining the space separation.

// Initiates the standard input stream. This is crucial for allowing the Node.js process
// to listen for incoming data from the command line or piped sources.
process.stdin.resume();

// Configures the encoding for the standard input stream. Setting it to 'utf8' ensures
// that incoming byte data is correctly interpreted as human-readable characters,
// which is essential for parsing numerical strings.
process.stdin.setEncoding('utf8');

// Defines a constant representing the precise number of numerical entries
// that this program is designed to process from the input.
const EXPECTED_NUM_COUNT = 3;

// Establishes an event listener on the standard input stream. The provided callback function
// will be invoked whenever a 'data' event occurs, typically when a line of input is received.
process.stdin.on('data', function (receivedInputBlock) {
    // Sanitizes the incoming data by removing any leading or trailing whitespace,
    // then splits the string into an array of individual string tokens using a space as the delimiter.
    const stringTokens = receivedInputBlock.trim().split(' ');

    // Initializes an empty array designated to hold the successfully parsed
    // integer values. Using 'let' allows for dynamic modification of the array.
    let numericalCollection = [];

    // A preliminary validation check to ensure that the number of provided tokens
    // is at least what is minimally required. If not, a warning is issued.
    if (stringTokens.length < EXPECTED_NUM_COUNT) {
        console.error(`Warning: Insufficient input tokens. Expected at least ${EXPECTED_NUM_COUNT}, but found ${stringTokens.length}.`);
        // The script will attempt to process what's available up to the expected count.
    }

    // Iterates through the obtained string tokens. The loop is capped either by
    // the total number of tokens available or by the `EXPECTED_NUM_COUNT`,
    // whichever is smaller, to prevent out-of-bounds access.
    for (let currentIndex = 0; currentIndex < Math.min(stringTokens.length, EXPECTED_NUM_COUNT); currentIndex++) {
        // Attempts to convert the current string token into an integer using base 10.
        const parsedInteger = parseInt(stringTokens[currentIndex], 10);

        // Performs a validity check to determine if the `parseInt` operation
        // resulted in a legitimate number (not NaN - Not a Number).
        if (isNaN(parsedInteger)) {
            console.error(`Error: Input fragment '${stringTokens[currentIndex]}' at index ${currentIndex} is not a valid integer. This entry will be skipped.`);
            // If an invalid entry is encountered, the current iteration is skipped,
            // and the loop proceeds to the next token.
            continue;
        }

        // Appends the successfully parsed and validated integer to the collection array.
        numericalCollection.push(parsedInteger);
    }

    // A critical post-parsing validation step. This ensures that after all parsing and
    // validation, the `numericalCollection` contains precisely the `EXPECTED_NUM_COUNT`
    // of valid integers. If not, a fatal error is logged, and the handler exits.
    if (numericalCollection.length !== EXPECTED_NUM_COUNT) {
        console.error(`Critical Failure: Could not assemble ${EXPECTED_NUM_COUNT} valid numbers from the input. Only ${numericalCollection.length} were processed.`);
        return; // Terminates further processing for this input block.
    }

    // Sorts the array of collected numbers. A custom comparison function `(a, b) => a - b`
    // is supplied to ensure a correct numerical ascending sort, as the default `sort()`
    // method would perform a lexicographical (string-based) comparison.
    numericalCollection.sort((firstElement, secondElement) => firstElement - secondElement);

    // Constructs the final output string by concatenating the sorted numbers,
    // using a single space as the separator between each number. This method is
    // generally more efficient and readable than manual string concatenation.
    const finalResultString = numericalCollection.join(' ');

    // Prints the meticulously prepared string of sorted numbers to the standard output.
    console.log(finalResultString);
});