process.stdin.on("data", function(inputChunk) {
    // Initialize variables for the current processing block.
    // currentString: Holds the string being manipulated.
    // processingState: Manages the state of parsing, indicating what kind of line is expected next.
    //                  0: Initial state or after a string rotation.
    //                  1: A new base string has just been received, expecting the first rotation number.
    //                  2: The first rotation number has been processed, expecting subsequent rotation numbers.
    let currentString = '';
    let processingState = 0;

    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // and split it into individual lines. The 'some' method allows for early termination
    // of the line processing loop if a specific condition is met.
    (inputChunk + '').trim().split('\n').some(function(inputLine) {
        // Check if the current line is the block termination character.
        if (inputLine === '-') {
            console.log(currentString); // Output the final manipulated string for this block.
            return true; // Return true to stop iterating over the lines in this chunk.
        }

        // Use a regular expression to determine if the line contains any non-digit characters.
        // This signifies the beginning of a new string manipulation sequence.
        if (/\D/.test(inputLine)) {
            // If there's an existing string in 'currentString', it means a previous block
            // was implicitly terminated (e.g., a new string started without a hyphen).
            // In such cases, print the previous string before starting a new one.
            if (currentString) {
                console.log(currentString);
            }
            processingState = 1; // Update state to indicate a new base string has been set.
            currentString = inputLine; // Store this line as the new string to be manipulated.
        }
        // If the line is numeric and the state is 1 (meaning we just received a new base string).
        else if (processingState === 1) {
            processingState = 2; // Transition to state 2, indicating the first rotation number has been accounted for.
        }
        // If the line is numeric and the state is 0 (initial) or 2 (subsequent rotation numbers).
        else {
            // Perform a string rotation operation.
            // '+inputLine' converts the numeric string to a number, used as the rotation offset.
            // The string is effectively cut at the offset and the two parts are swapped.
            currentString = currentString.slice(+inputLine) + currentString.slice(0, +inputLine);
        }
        return false; // Return false to continue iterating over the remaining lines in the chunk.
    });
}).resume(); // Ensure the standard input stream remains active to receive further data.
