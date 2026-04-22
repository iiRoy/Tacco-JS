// This script processes numerical input lines from standard input.
// Each line should contain two space-separated integers: maximumValue and requiredSum.
// The program counts unique combinations of three distinct integers (valA, valB, valC)
// such that 1 <= valA < valB < valC <= maximumValue and valA + valB + valC = requiredSum.
// Processing halts if a line contains "0 0".

process.stdin.on("data", (inputBufferSegment) => {
    // Convert the incoming data buffer to a string, trim any leading/trailing whitespace,
    // and then split it into individual lines.
    // The .some() method is used to iterate over lines, allowing for early termination
    // if the callback function returns true (which happens for the "0 0" sentinel).
    String(inputBufferSegment)
        .trim()
        .split("\n")
        .some((processedLine, lineIndex) => {
            // Guard clause: Skip any empty lines that might result from trimming or extra newlines.
            if (!processedLine.trim()) {
                return false; // Continue to process the next line
            }

            // Split the line by one or more whitespace characters to get its components.
            const lineComponents = processedLine.split(/\s+/);

            // Basic validation: Ensure there are at least two components (for maximumValue and requiredSum).
            if (lineComponents.length < 2) {
                console.error(`Warning: Line ${lineIndex + 1} ("${processedLine}") has insufficient components. Skipping.`);
                return false; // Continue processing other lines
            }

            // Parse the numerical values from the components, specifying base 10.
            const maximumValue = parseInt(lineComponents[0], 10);
            const requiredSum = parseInt(lineComponents[1], 10);

            // Validation: Check if parsing resulted in valid numbers.
            if (isNaN(maximumValue) || isNaN(requiredSum)) {
                console.error(`Warning: Line ${lineIndex + 1} ("${processedLine}") contains non-numeric values. Skipping.`);
                return false; // Continue processing other lines
            }

            // Termination condition: If both maximumValue and requiredSum are zero,
            // this signals the end of input processing.
            if (maximumValue === 0 && requiredSum === 0) {
                return true; // Signal the .some() method to stop iteration
            }

            // Initialize a counter for the number of valid combinations found for the current line.
            let foundCombinationsCount = 0;

            // Early exit guard: If maximumValue is less than 3, it's impossible to choose
            // three distinct integers, so the count will always be zero.
            if (maximumValue < 3) {
                 console.log(foundCombinationsCount); // Output 0
                 return false; // Continue to the next line
            }

            // Loop for the first number (valA).
            // valA starts from 1. Its maximum value is `maximumValue - 2` to ensure there are
            // at least two larger distinct numbers (valB and valC) possible within `maximumValue`.
            for (let valA = 1; valA <= maximumValue - 2; valA++) {

                // Calculate the upper bound for the second number (valB).
                // 1. valB must be strictly less than valC (valB < valC).
                //    Since valC = requiredSum - valA - valB, this implies valB < requiredSum - valA - valB,
                //    which simplifies to 2 * valB < requiredSum - valA, or valB < (requiredSum - valA) / 2.
                //    We use Math.floor((requiredSum - valA - 1) / 2) to get the largest integer valB
                //    that satisfies valB < valC.
                // 2. valB must also be at most `maximumValue - 1` (to allow for valC).
                const valBUpperBound = Math.min(
                    maximumValue - 1,
                    Math.floor((requiredSum - valA - 1) / 2)
                );

                // Loop for the second number (valB).
                // valB must be strictly greater than valA.
                for (let valB = valA + 1; valB <= valBUpperBound; valB++) {
                    // Directly calculate the third number (valC) using the sum equation.
                    const valC = requiredSum - valA - valB;

                    // Check if the calculated valC is within the allowed range (<= maximumValue).
                    // The condition valC > valB is implicitly handled by the valBUpperBound calculation,
                    // so we only need to check the upper limit.
                    if (valC <= maximumValue) {
                        foundCombinationsCount++; // Increment the counter if a valid triple is found.
                    }
                }
            }

            // Output the total count of found combinations for the current line's parameters.
            console.log(foundCombinationsCount);
            return false; // Continue processing any subsequent lines
        });
}).resume(); // Ensure the standard input stream remains open and active to receive data.