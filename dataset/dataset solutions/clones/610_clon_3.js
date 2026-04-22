process.stdin.resume(); // Activates the standard input stream to listen for data.
process.stdin.setEncoding('utf8'); // Configures the input stream to interpret data as UTF-8 encoded text.

// A buffer to accumulate all incoming data chunks from stdin.
let collectedInputData = '';

// Event listener for when data chunks are received from stdin.
process.stdin.on('data', (incomingChunk) => {
    // Append the current chunk to our accumulated data.
    collectedInputData += incomingChunk;
});

// Event listener for when the standard input stream has ended (no more data).
process.stdin.on('end', () => {
    // Split the entire collected input into individual lines, filtering out any empty ones.
    const processedInputLines = collectedInputData
                                    .split('\n')
                                    .map(line => line.trim()) // Trim whitespace from each line
                                    .filter(line => line.length > 0); // Remove truly empty lines

    // --- Input Validation and Parsing ---

    // Ensure there are at least two lines for the board count and the search pattern.
    if (processedInputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines (number of boards, search pattern).");
        return; // Terminate execution gracefully.
    }

    // Parse the first line as the total number of board entries to process.
    const rawBoardCount = processedInputLines[0];
    const totalBoardEntries = Number.parseInt(rawBoardCount, 10);

    // Validate the parsed number of entries.
    if (Number.isNaN(totalBoardEntries) || totalBoardEntries < 0) {
        console.error(`Error: Invalid number specified for board entries: '${rawBoardCount}'. Must be a non-negative integer.`);
        return;
    }

    // The second line is the pattern string we are looking for.
    const targetSearchPattern = processedInputLines[1];
    // Convert the pattern string into an array of characters once for efficiency.
    const patternCharacterArray = targetSearchPattern.split('');
    const patternLength = patternCharacterArray.length;

    // If the pattern is empty, it cannot be "found".
    if (patternLength === 0) {
        console.log(0);
        return;
    }

    // Initialize a counter for how many boards successfully contain the pattern.
    let successfulPatternEmbeddings = 0;

    // --- Core Logic: Iterate through each board line ---
    // Boards start from the third line (index 2) in the processed input.
    for (let boardIterationIndex = 0; boardIterationIndex < totalBoardEntries; boardIterationIndex++) {
        const currentBoardLineIndex = boardIterationIndex + 2; // Offset for the initial count and pattern lines.

        // Guard against cases where fewer board lines are provided than declared.
        if (currentBoardLineIndex >= processedInputLines.length) {
            console.warn(`Warning: Expected ${totalBoardEntries} board lines, but only found ${boardIterationIndex} valid ones. Processing stopped prematurely.`);
            break;
        }
        
        const currentBoardString = processedInputLines[currentBoardLineIndex];
        const currentBoardStringLength = currentBoardString.length;

        let patternLocatedInCurrentBoard = false; // Flag to track if pattern is found for this specific board.

        // The original code's logic is very specific: it only checks if the *last character*
        // of the pattern matches at a specific derived position. The preceding characters
        // are not implicitly checked.
        const lastPatternCharPosition = patternLength - 1;

        // Iterate through various "spacing multiplier" values (equivalent to 'diff' in original).
        // This multiplier determines the non-linear index progression in the board string.
        for (let spacingMultiplier = 0; spacingMultiplier < currentBoardStringLength; spacingMultiplier++) {
            // Calculate the target index in the current board string for the LAST character of the pattern.
            // Original calculation: idx = j + diff*j; where j is the index in 'chars'.
            // Here, j is fixed to 'lastPatternCharPosition'.
            const calculatedBoardPosition = lastPatternCharPosition + (spacingMultiplier * lastPatternCharPosition);

            // Guard against out-of-bounds access. If the calculated position is beyond the board's length,
            // this spacing multiplier cannot result in a match.
            if (calculatedBoardPosition >= currentBoardStringLength) {
                continue; // Move to the next spacing multiplier.
            }

            // Compare the character at the calculated position on the board with the last character of the pattern.
            // This is the *only* condition that can set 'patternLocatedInCurrentBoard' to true in the original logic.
            if (currentBoardString[calculatedBoardPosition] === patternCharacterArray[lastPatternCharPosition]) {
                patternLocatedInCurrentBoard = true; // A match for the last character was found.
                break; // No need to check further spacing multipliers for this board.
            }
        }

        // If the pattern (specifically, its last character) was found for the current board, increment the total count.
        if (patternLocatedInCurrentBoard) {
            successfulPatternEmbeddings++;
        }
    }

    // Output the final count of boards where the pattern was successfully embedded.
    console.log(successfulPatternEmbeddings);
});