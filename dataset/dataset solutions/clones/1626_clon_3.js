(function executeDivisibilitySearch() {
    // A buffer to accumulate all incoming data from the standard input stream.
    // This variable serves the purpose of 'input' from the original implementation.
    let inputAccumulator = '';

    // Attach an event listener to process data as it arrives on standard input.
    // 'dataSegment' corresponds to 'chunk' in the initial code.
    process.stdin.on('data', (dataSegment) => {
        // Convert the incoming Buffer or string chunk to a string and append it.
        inputAccumulator += dataSegment.toString();
    });

    // Attach an event listener for when the standard input stream has ended.
    // All input has been received by this point.
    process.stdin.on('end', () => {
        // Attempt to parse the collected input string into an integer.
        // The .trim() method helps in removing any leading/trailing whitespace,
        // which might be present in the input stream.
        // This 'targetModulo' is the equivalent of 'k' from the original problem.
        const targetModulo = parseInt(inputAccumulator.trim(), 10);

        // --- Type III: Added Input Validation / Guard Clause ---
        // Validate the input to ensure it's a positive integer.
        // Non-positive or non-numeric inputs are considered invalid for this problem.
        if (isNaN(targetModulo) || targetModulo <= 0) {
            // Output an informative error message to the standard error stream.
            process.stderr.write("Input Error: A positive integer modulus is required.\n");
            // Terminate the process with an error code.
            process.exit(1);
        }

        // Initialize a variable to keep track of the current remainder when
        // forming numbers like 7, 77, 777, etc., modulo 'targetModulo'.
        // This 'currentRemainder' variable is analogous to 'x' in the initial code.
        let currentRemainder = 0;

        // Initialize a counter for the number of '7's appended so far.
        // This 'sevenCount' variable replaces 'i' from the original loop.
        let sevenCount = 0;

        // --- Type III: Structural Change - While Loop Instead of For Loop ---
        // Iterate to find the solution. The problem guarantees a solution
        // will be found within 'targetModulo' iterations if one exists.
        // We use a pre-increment for 'sevenCount' inside the loop for a different flow.
        while (sevenCount < targetModulo) {
            // Increment the count of '7's for the current iteration.
            sevenCount++;

            // --- Type III: Rewritten Calculation with Intermediate Step ---
            // Calculate the next number in the sequence (e.g., from 7 to 77).
            // (currentRemainder * 10) effectively shifts the previous number left by one decimal place.
            // Then, adding 7 appends a '7' to it.
            let intermediateValue = (currentRemainder * 10) + 7;

            // Take the modulo with 'targetModulo' to get the new remainder.
            currentRemainder = intermediateValue % targetModulo;

            // --- Type III: Updated Conditional Check ---
            // If the current remainder is zero, it means the number formed by 'sevenCount' '7's
            // is perfectly divisible by 'targetModulo'.
            if (currentRemainder === 0) {
                // Output the 'sevenCount' to standard output, followed by a newline.
                // Using process.stdout.write is a low-level alternative to console.log.
                process.stdout.write(String(sevenCount) + '\n');
                // The task is complete, so we exit this handler.
                // An explicit 'return' statement is used to stop further execution in this event handler.
                return;
            }
        }

        // --- Type III: Modified Fallback Output ---
        // If the loop completes without finding a remainder of zero,
        // it means no such number was found within the allowed iterations.
        // In this scenario, output -1 as per the problem specification.
        process.stdout.write("-1\n");
    });

    // --- Type III: Added Error Handling for Input Stream ---
    // Register an error handler for the standard input stream.
    // This catches potential issues during input reading itself.
    process.stdin.on('error', (err) => {
        // Output the error message to standard error.
        process.stderr.write(`An unexpected input stream error occurred: ${err.message}\n`);
        // Exit the process indicating a failure.
        process.exit(1);
    });

})(); // Immediately invoke the function to start the execution flow.