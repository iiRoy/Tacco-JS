process.stdin.on("data", function(inputBuffer) {
    let stringAccumulator = "";
    let processingMode = 0; // 0: initial, 1: after non-digit, 2: after first number

    const TERMINATOR_SIGNAL = "-";
    const NON_DIGIT_PATTERN = /\D/;

    // Helper function to perform string rotation based on original slice behavior
    const rotateStringByAmount = (targetStr, rotationValStr) => {
        const rotationIndex = +rotationValStr; // Convert string to number
        if (rotationIndex >= targetStr.length) {
            // Original behavior: if rotation amount is >= string length, it effectively does nothing.
            // e.g., "abc".slice(3) + "abc".slice(0,3) -> "" + "abc" -> "abc"
            return targetStr;
        }
        return targetStr.slice(rotationIndex) + targetStr.slice(0, rotationIndex);
    };

    const inputLines = String(inputBuffer).trim().split("\n");
    let shouldHaltProcessing = false;

    for (const currentLine of inputLines) {
        if (shouldHaltProcessing) {
            break; // Exit loop if termination signal was encountered
        }

        if (currentLine === TERMINATOR_SIGNAL) {
            console.log(stringAccumulator);
            shouldHaltProcessing = true; // Set flag to terminate
            break; // Immediately exit the loop
        }

        // Check if the line contains any non-digit characters
        if (NON_DIGIT_PATTERN.test(currentLine)) {
            // If there's an accumulated string, print it before starting a new one
            if (stringAccumulator.length > 0) {
                console.log(stringAccumulator);
            }
            processingMode = 1; // Transition to state: just received a non-digit string
            stringAccumulator = currentLine; // Start accumulating the new string
        } else { // The line contains only digits
            if (processingMode === 1) {
                // If we just received a non-digit string, this is the first number after it.
                // We ignore this number for rotation, just change the mode.
                processingMode = 2; // Transition to state: received first number after non-digit
            } else {
                // In other modes (0: initial, 2: after first number), perform rotation
                stringAccumulator = rotateStringByAmount(stringAccumulator, currentLine);
            }
        }
    }
}).resume();
