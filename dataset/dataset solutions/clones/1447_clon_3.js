process.stdin.on("data", function(rawInputBuffer) {
    // Normalize and split the incoming data buffer into an array of individual lines.
    // This handles potential multi-line input received in a single 'data' event.
    const processedInputLines = String(rawInputBuffer).trim().split('\n');
    let currentLineIndex = 0; // Initialize a cursor to track the current line being processed.

    // Main processing loop: continues as long as there are lines to read
    // and the current line can be parsed as a positive number (indicating a new data block).
    while (currentLineIndex < processedInputLines.length) {
        const lineWithElementCount = processedInputLines[currentLineIndex];
        const elementCount = Number.parseFloat(lineWithElementCount); // Attempt to parse the element count.

        // Termination condition: If the parsed element count is not a number (NaN)
        // or is explicitly zero, it signals the end of meaningful input blocks.
        if (isNaN(elementCount) || elementCount === 0) {
            break; // Exit the loop, no more data blocks to process.
        }

        // Advance the cursor to the next line, which should contain the actual numbers.
        currentLineIndex++;

        // Guard against unexpected end of input after reading the count but before numbers.
        if (currentLineIndex >= processedInputLines.length) {
            // Optionally, log an error or handle this incomplete block differently.
            // For this clone, we simply stop if the data is malformed this way.
            break;
        }

        // Split the line of numbers into an array of string representations.
        const numericStrings = processedInputLines[currentLineIndex].split(" ");
        const dataValues = []; // Array to store the parsed numerical values.

        // Iterate through the string numbers, parsing and validating each one.
        for (const singleNumericString of numericStrings) {
            const parsedValue = Number.parseFloat(singleNumericString);
            // Only add valid numbers to our data set. This implicitly handles empty strings
            // or non-numeric entries within the numbers line.
            if (!isNaN(parsedValue)) {
                dataValues.push(parsedValue);
            }
        }

        // Guard against an empty data set after parsing, which would lead to division by zero.
        if (dataValues.length === 0) {
            console.log("0.00000000"); // Standard deviation of an empty set is undefined; outputting 0.
            currentLineIndex++; // Move to the next potential block.
            continue; // Skip to the next iteration of the main loop.
        }

        // Determine the effective count of elements actually used in calculations.
        // This is a Type III update: it uses the actual number of valid data points
        // found, making the calculation more robust than strictly relying on `elementCount`
        // if the input line had fewer valid numbers than declared.
        const effectiveElementCount = dataValues.length;

        let totalSum = 0; // Initialize accumulator for the sum of all values.
        // First pass: Calculate the sum of all numerical values.
        for (const val of dataValues) {
            totalSum += val;
        }

        // Calculate the arithmetic mean (average) of the data set.
        const calculatedMean = totalSum / effectiveElementCount;

        let sumOfSquaredDiffs = 0; // Initialize accumulator for the sum of squared differences from the mean.
        // Second pass: Calculate the sum of (value - mean)^2 for each value.
        for (const val of dataValues) {
            const deviation = val - calculatedMean;
            sumOfSquaredDiffs += deviation * deviation; // Prefer multiplication over Math.pow for performance.
        }

        // Calculate the variance (average of the squared differences).
        const variance = sumOfSquaredDiffs / effectiveElementCount;
        // The standard deviation is the square root of the variance.
        const standardDeviation = Math.sqrt(variance);

        // Output the calculated standard deviation, formatted to 8 decimal places.
        console.log(standardDeviation.toFixed(8));

        // Advance the cursor to the start of the next potential input block.
        currentLineIndex++;
    }
}).resume(); // Ensures that the Node.js process keeps listening for input on stdin.