(function(sourceDataInput) {
    // This constant defines the regular expression used to split the input string into individual lines.
    // It's designed to handle both Windows-style (\r\n) and Unix-style (\n) line endings robustly.
    const LINE_BREAK_PATTERN = /\r?\n/;

    // --- Initial Input Validation ---
    // A robust check to ensure that the provided input is indeed a non-empty string.
    // If the input is not valid, an error message is logged, and the processing function exits early.
    if (typeof sourceDataInput !== 'string' || sourceDataInput.length === 0) {
        console.error("Operation Aborted: The provided input data is either not a string or is completely empty.");
        return; // Terminate execution as there's no valid data to process.
    }

    // --- Data Preparation ---
    // The raw input string is segmented into an array of strings, where each element represents a line
    // that potentially contains a JavaScript expression to be evaluated.
    let expressionLineArray = sourceDataInput.split(LINE_BREAK_PATTERN);

    // --- Control Variables for Iteration and State Tracking ---
    // A counter to keep track of how many expressions were successfully processed and evaluated.
    let evaluatedExpressionsCounter = 0;
    // A boolean flag that indicates if the processing loop was terminated prematurely
    // due to a specific condition (e.g., encountering a halt character).
    let prematureTerminationFlag = false;

    // --- Core Processing Loop ---
    // This loop iterates through each line (potential expression) obtained from the input.
    // Using `let` for the loop index ensures block-scoping.
    for (let currentLineIndex = 0; currentLineIndex < expressionLineArray.length; currentLineIndex++) {
        // Retrieve the current line and remove any leading/trailing whitespace.
        // Trimming helps in processing cleaner expressions and avoiding issues with empty strings.
        let currentExpressionText = expressionLineArray[currentLineIndex].trim();

        // --- Pre-evaluation Validation: Skip Empty Lines ---
        // If a line becomes empty after trimming, it's considered non-essential and is skipped.
        // This prevents attempting to evaluate empty strings, which could lead to unexpected `eval` behavior.
        if (currentExpressionText.length === 0) {
            console.warn(`Line ${currentLineIndex + 1} appears to be empty after trimming. Skipping evaluation.`);
            continue; // Proceed to the next line without further action for this one.
        }

        // --- Termination Condition Check ---
        // This is a critical control flow mechanism. If the current expression string
        // contains a specific "question mark" character, it signals an immediate halt
        // to all further processing. This acts as a sentinel value.
        if (currentExpressionText.includes('?')) {
            console.info(`Interruption detected: Found the '?' character on line ${currentLineIndex + 1}. Halting all subsequent evaluations.`);
            prematureTerminationFlag = true; // Set the flag to indicate early termination.
            break; // Exit the `for` loop immediately.
        }

        // --- Dynamic Code Execution (Evaluation) ---
        // The `eval()` function is used here to execute the JavaScript code contained within `currentExpressionText`.
        // It's wrapped in a `try...catch` block to gracefully handle any runtime errors
        // that might occur during the evaluation of potentially malformed or erroneous expressions.
        try {
            // Execute the JavaScript expression. The result is stored in a temporary variable.
            let computedValue = eval(currentExpressionText);

            // Log the result of the evaluation to the console. A distinctive prefix is added
            // to make the output clearly identifiable as an evaluation result.
            console.log(`[Computed Result]: ${computedValue}`);
            evaluatedExpressionsCounter++; // Increment the count for successfully evaluated expressions.

        } catch (executionError) {
            // If an error occurs during `eval()`, catch it and log a detailed error message.
            // This includes the line number, the problematic expression, and the error message itself.
            console.error(`Evaluation Error on line ${currentLineIndex + 1} ('${currentExpressionText}'): ${executionError.message}`);
        }
    }

    // --- Final Execution Summary ---
    // After the loop completes (either naturally or due to premature termination),
    // a summary message is displayed to inform the user about the outcome.
    if (prematureTerminationFlag) {
        console.log(`Processing concluded early. Successfully evaluated ${evaluatedExpressionsCounter} expressions before the halt signal.`);
    } else {
        console.log(`All available expressions (${evaluatedExpressionsCounter}) were processed without interruption.`);
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // This immediately invoked function expression (IIFE)
// reads the entire content of the standard input stream (`/dev/stdin`) as a UTF-8 string
// and passes it as an argument to the anonymous processing function.