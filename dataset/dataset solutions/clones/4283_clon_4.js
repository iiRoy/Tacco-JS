"use strict";

const assessTextForPattern = (incomingData) => {
    // Stage 1: Input preparation - completely different from original's `trim().split("\n")[0].split("")`
    // Extracts the first line from the input and removes leading/trailing whitespace from that specific line.
    const primaryLineContent = incomingData.split('\n')[0].trim();

    // Stage 2: Pattern detection - completely different from original's imperative loop with state
    // Utilizes a built-in string method to check for substring presence directly.
    const patternExists = primaryLineContent.includes('AC');

    // Stage 3: Result output - completely different from original's conditional console.log with early return
    // Writes the determination directly to standard output.
    process.stdout.write(patternExists ? 'Yes' : 'No');
};

// Stage 4: Execution - different function name and input reading method
// Reads all data from standard input (file descriptor 0) and passes it to the assessment function.
assessTextForPattern(require('fs').readFileSync(0, 'utf8'));