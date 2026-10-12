function processInputData(rawData) {
    // Split the raw input string into an array of lines.
    const lineSegments = rawData.split('\n');
    // Parse the first line to get the total number of test cases.
    const testCaseCount = parseInt(lineSegments[0], 0xA); // Using 0xA for radix 10

    // Iterate through each test case, starting from the second line.
    for (let idx = 0x1; idx <= testCaseCount; idx++) {
        // Initialize a flag to track if a solution is found for the current test case.
        let foundSolution = 0x0;
        // Split the current line into an array of numbers (as strings).
        const currentNumbers = lineSegments[idx].split(' ');

        // Parse the four integer values for the current test case.
        let valX = parseInt(currentNumbers[0]);
        const valY = parseInt(currentNumbers[1]);
        const valZ = parseInt(currentNumbers[2]);
        const valW = parseInt(currentNumbers[3]);

        // Store the initial value of valX for comparison later.
        const initialX = valX;
        // Calculate the initial transformed value of valX using modulo.
        let transformedX = valX % valY;

        // First set of conditional checks.
        if (valX < valY) {
            console.log("No");
            continue; // Move to the next test case.
        }
        if (valW < valY) {
            console.log("No");
            continue; // Move to the next test case.
        }
        if (valX < valZ) {
            console.log("Yes");
            continue; // Move to the next test case.
        }

        // Adjust valX for the main loop.
        valX = transformedX + valY;

        // Main loop for the transformation process.
        while (valX >= valY) {
            // Check if the difference (valX - valY) is within the limit valZ.
            if ((valX - valY) <= valZ) {
                // Apply transformation with valW.
                transformedX = valX - valY + valW;
                valX = transformedX;
            } else {
                // Apply simpler transformation.
                transformedX = valX - valY;
                valX = transformedX;
            }

            // Check if the current valX has reached or exceeded its initial value.
            if (valX >= initialX) {
                console.log("Yes");
                foundSolution = 0x1; // Set flag to indicate a solution was found.
                break; // Exit the while loop.
            }
        }

        // If no solution was found after the loop, print "No".
        if (foundSolution === 0x0) {
            console.log("No");
        }
    }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
