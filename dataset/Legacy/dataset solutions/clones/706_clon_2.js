function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    rawData = rawData.split("\n");
    // Initialize an index to keep track of the current line being processed.
    let lineIndex = 0;

    // Loop indefinitely to process multiple test cases until a termination condition is met.
    while (true) {
        // Split the current line (which contains N and M) by spaces.
        rawData[lineIndex] = rawData[lineIndex].split(" ");
        // Parse the number of T items (N) and H items (M) from the current line.
        // The lineIndex is incremented after M is read, preparing for the next line.
        const numTItems = parseInt(rawData[lineIndex][0], 10);
        const numHItems = parseInt(rawData[lineIndex++][1], 10);

        // Check if both N and M are zero, which is the termination condition for the loop.
        if (numTItems === 0 && numHItems === 0) {
            break; // Exit the main processing loop.
        }

        // Initialize arrays to store T and H values, and variables for their sums.
        const tValues = [];
        const hValues = [];
        let totalT = 0;
        let totalH = 0;

        // Read N T-values from subsequent lines and calculate their sum.
        for (let idxA = 0; idxA < numTItems; idxA++) {
            tValues[idxA] = parseInt(rawData[lineIndex++], 10); // Parse value and advance line index.
            totalT += tValues[idxA];
        }

        // Read M H-values from subsequent lines and calculate their sum.
        for (let idxA = 0; idxA < numHItems; idxA++) {
            hValues[idxA] = parseInt(rawData[lineIndex++], 10); // Parse value and advance line index.
            totalH += hValues[idxA];
        }

        // If the combined total sum of T and H values is odd, it's impossible to balance them
        // by swapping two numbers, so output -1 and proceed to the next test case.
        if ((totalT + totalH) % 2 !== 0) {
            console.log("-1");
            continue; // Skip the rest of the current test case and go to the next iteration.
        }

        // A flag to indicate whether a suitable swap has been found.
        let foundSwap = false;

        // Iterate through each T value.
        for (let idxA = 0; idxA < numTItems; idxA++) {
            // For each T value, iterate through each H value.
            for (let idxB = 0; idxB < numHItems; idxB++) {
                // Check if swapping tValues[idxA] and hValues[idxB] would make the sums equal.
                // The condition is: (totalT - tValues[idxA] + hValues[idxB]) === (totalH + tValues[idxA] - hValues[idxB])
                if (totalT - tValues[idxA] + hValues[idxB] === totalH + tValues[idxA] - hValues[idxB]) {
                    foundSwap = true; // Mark that a swap was found.
                    console.log(tValues[idxA] + " " + hValues[idxB]); // Output the pair of values.
                    break; // Exit the inner loop as we only need one such pair.
                }
            }
            // If a swap was found in the inner loop, exit the outer loop as well.
            if (foundSwap) {
                break;
            }
        }

        // If after checking all pairs, no suitable swap was found, output -1.
        if (!foundSwap) {
            console.log("-1");
        }
    }
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
