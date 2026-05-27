function ProcessData(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    rawData = rawData.split("\n");

    // Loop indefinitely until a specific break condition is met.
    for (let idx = 0; ; idx++) {
        // Split the current line into parts based on space.
        rawData[idx] = rawData[idx].split(" ");

        // Parse the first part as an integer (base 10).
        const valX = parseInt(rawData[idx][0], 10);
        // Parse the second part as an integer (base 10).
        const valY = parseInt(rawData[idx][1], 10);
        // Parse the third part as an integer (base 10).
        const totalSum = parseInt(rawData[idx][2], 10);

        // Check for the termination condition: all three values are zero.
        if (valX === 0 && valY === 0 && totalSum === 0) {
            break; // Exit the infinite loop.
        }

        // Initialize a variable to store the maximum calculated sum for the current set of inputs.
        let greatestResult = 0;

        // Iterate through possible splits of 'totalSum' into two parts.
        for (let partOne = 1; partOne < totalSum; partOne++) {
            // Create an array to hold the two parts.
            const partsArray = [];
            // The first part is 'partOne'.
            partsArray[0] = partOne;
            // The second part is 'totalSum' minus 'partOne'.
            partsArray[1] = totalSum - partOne;

            // Initialize current total and a flag for error detection.
            let currentTotal = 0;
            let errorDetected = false;

            // Process each of the two parts.
            for (let partIndex = 0; partIndex < 2; partIndex++) {
                // Calculate an intermediate value 'intermediateValB' based on the current part and valX.
                let intermediateValB = Math.floor(partsArray[partIndex] / (100 + valX) * 100) + 1;
                // Adjust 'intermediateValB' downwards until a condition is met.
                while (intermediateValB * (100 + valX) / 100 >= partsArray[partIndex] + 1) {
                    intermediateValB--;
                }
                // Check if 'intermediateValB' leads to an invalid state.
                if (intermediateValB * (100 + valX) / 100 < partsArray[partIndex]) {
                    errorDetected = true; // Set the flag if an error is detected.
                }
                // Calculate another intermediate value 'calculatedValC' based on 'intermediateValB' and valY.
                let calculatedValC = Math.floor(intermediateValB * (100 + valY) / 100);
                // Adjust 'calculatedValC' if it's just below a specific threshold.
                if (calculatedValC + 1 === intermediateValB * (100 + valY) / 100) {
                    calculatedValC++;
                }
                // Add 'calculatedValC' to the current total.
                currentTotal += calculatedValC;
            }
            // If an error was detected during the processing of parts, skip this iteration.
            if (errorDetected) {
                continue;
            }
            // If the current total is greater than the previously recorded maximum, update the maximum.
            if (greatestResult < currentTotal) {
                greatestResult = currentTotal;
            }
        }
        // Output the maximum sum found for the current input set.
        console.log(greatestResult);
    }
}

// Read input from standard input and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
