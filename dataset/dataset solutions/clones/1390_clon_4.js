(function(sourceData) {
    const extractSegments = (fullText) => {
        // Splits the entire input string into an array of lines.
        // This mirrors the original's `split('\n')` behavior, including empty strings for trailing newlines.
        return fullText.split('\n');
    };

    const transformAndFilter = (linesCollection) => {
        let collectedRenderings = [];
        let processingInterrupted = false;

        // Iterates through the lines using a higher-order array method (`every`)
        // to allow for early termination, mimicking a `for` loop with `break`.
        linesCollection.every(lineFragment => {
            if (processingInterrupted) {
                return false; // Stops the iteration if the termination condition was met in a previous line
            }

            // Parses each line into two potential numeric parts.
            // This replicates the original's `split(' ')` behavior, including handling of undefined parts.
            const componentParts = lineFragment.split(' ');

            // Converts the parts to numbers using the unary plus operator,
            // which behaves identically to the original's `- 0` for type coercion,
            // including producing `NaN` for non-numeric or `undefined` values.
            const firstNumericVal = +(componentParts[0]);
            const secondNumericVal = +(componentParts[1]);

            // Checks for the termination condition (both values are 0).
            if (firstNumericVal === 0 && secondNumericVal === 0) {
                processingInterrupted = true;
                return false; // Terminates the `every` iteration
            }

            // Determines the order for output using Math.min and Math.max,
            // a functional alternative to the original's `if/else` block.
            const formattedOutput = `${Math.min(firstNumericVal, secondNumericVal)} ${Math.max(firstNumericVal, secondNumericVal)}`;
            collectedRenderings.push(formattedOutput);

            return true; // Continues the `every` iteration
        });

        // Joins all collected output strings with newline characters.
        // This produces a single string that matches the concatenated output of multiple `console.log` calls.
        return collectedRenderings.join('\n');
    };

    // Acquires input data using a different alias for the 'fs' module.
    const fileInteractor = require("node:fs");
    const rawInputContent = fileInteractor.readFileSync("/dev/stdin", "utf8");

    const processedSegments = extractSegments(rawInputContent);
    const finalFormattedResult = transformAndFilter(processedSegments);

    // Outputs the final result using `process.stdout.write`,
    // which is a lower-level alternative to `console.log`.
    // An additional newline is appended if there was any output,
    // to match `console.log`'s behavior of always adding a newline.
    process.stdout.write(finalFormattedResult + (finalFormattedResult.length > 0 ? '\n' : ''));
})(/* The anonymous function is immediately invoked with the input data */);