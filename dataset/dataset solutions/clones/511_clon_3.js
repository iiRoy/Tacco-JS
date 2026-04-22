globalThis.process.stdin.resume();
globalThis.process.stdin.setEncoding('utf8');

/**
 * Safely parses a string into an integer.
 * @param {string} strRepresentation - The string to parse.
 * @returns {number} The parsed integer value.
 */
const obtainNumericValue = (strRepresentation) => {
    const numericResult = parseInt(strRepresentation, 10);
    // In a real-world scenario, one might add error handling for NaN.
    // For this context, we assume valid numerical inputs as per problem constraints.
    return numericResult;
};

/**
 * Event listener for incoming data from standard input.
 * Processes numerical sequences to find outliers based on specific difference patterns.
 */
globalThis.process.stdin.on('data', function(rawDataSegment){
    // Normalize and segment the raw input into distinct lines.
    const inputPayloads = rawDataSegment.trim().split("\n");
    let lineIterator = 0; // Tracks the current line being processed from inputPayloads.

    // Loop through the input lines, processing each data set.
    while(lineIterator < inputPayloads.length){
        // The first value on a line indicates the size of the subsequent numerical sequence.
        const sequenceSize = obtainNumericValue(inputPayloads[lineIterator++]);
        
        // A sequence size of zero acts as a termination signal for input processing.
        if (sequenceSize === 0) {
            break; 
        }

        // Basic validation: A sequence needs at least two elements for difference calculation.
        // The problem's patterns also typically require more.
        if (sequenceSize < 2) {
            // If the sequence size is invalid, we might need to consume the next line
            // if it was supposed to contain the actual data, then skip to the next dataset.
            if (lineIterator < inputPayloads.length) {
                 lineIterator++; // Consume the (potentially empty/invalid) data line.
            }
            continue; // Move to the next sequence.
        }

        // Extract and split the numerical sequence string from the next line.
        const numericSequenceTokens = inputPayloads[lineIterator++].trim().split(" ");
        
        // Data integrity check: Ensure the number of provided tokens matches the declared sequence size.
        if (numericSequenceTokens.length !== sequenceSize) {
            // If there's a mismatch, this dataset is malformed; skip it.
            continue; 
        }

        // Convert all string tokens into actual numbers.
        const parsedValues = numericSequenceTokens.map(obtainNumericValue);

        // This array will store the differences between consecutive elements.
        // It's 0-indexed: differenceArray[k] holds parsedValues[k+1] - parsedValues[k].
        const differenceArray = []; 
        let previousNumericElement = parsedValues[0];

        // Populate the differenceArray.
        for(let loopIndex = 1; loopIndex < sequenceSize; ++loopIndex){
            const currentNumericElement = parsedValues[loopIndex];
            differenceArray.push(currentNumericElement - previousNumericElement);
            previousNumericElement = currentNumericElement; // Set up for the next iteration.
        }

        // --- Outlier Detection Logic: Analyzing difference patterns ---
        // Many patterns require at least 4 differences (i.e., 5 elements in the original sequence).
        // If we don't have enough differences, complex patterns won't apply.
        if (differenceArray.length < 4) {
            // The original code implicitly handles this by conditions failing.
            // For a Type III clone, we can choose to explicitly handle or let it fall through.
            // We'll let it fall through, as the `if-else if` structure will naturally skip.
            // If no condition matches, `identifiedOutlier` remains null.
        }

        // Assign the first few differences to named variables for enhanced readability.
        const firstDifference = differenceArray[0];  // Corresponds to original map[1]
        const secondDifference = differenceArray[1]; // Corresponds to original map[2]
        const thirdDifference = differenceArray[2];  // Corresponds to original map[3]
        const fourthDifference = differenceArray[3]; // Corresponds to original map[4]

        let identifiedOutlier = null; // This variable will store the value of the detected outlier.

        // Pattern 1: Initial differences are consistent, but a later element breaks the trend.
        if (firstDifference === secondDifference && secondDifference === thirdDifference && thirdDifference === fourthDifference) {
            const commonPatternDiff = firstDifference;
            let potentialOutlierIndex = -1; // Index in `parsedValues` array.
            
            // Iterate through subsequent differences starting from the 5th element's difference (index 4 in differenceArray).
            // The loop checks up to the last possible difference, which is `differenceArray[sequenceSize - 1]`.
            for (let diffArrayIndex = 4; diffArrayIndex < sequenceSize; ++diffArrayIndex) {
                if (differenceArray[diffArrayIndex] !== commonPatternDiff) {
                    // If a deviation is found, the outlier is the element *after* the current difference.
                    potentialOutlierIndex = diffArrayIndex + 1; 
                    break; // Stop at the first identified outlier.
                }
            }
            // If an outlier was successfully found within this pattern, assign its value.
            if (potentialOutlierIndex !== -1) {
                identifiedOutlier = parsedValues[potentialOutlierIndex];
            }
            // Note: If all differences are consistent, `identifiedOutlier` remains null for this branch,
            // allowing subsequent `else if` conditions to be evaluated (as per original logic).
        } 
        // Pattern 2: Differences 2, 3, and 4 are identical. The first element is the outlier.
        else if (secondDifference === thirdDifference && thirdDifference === fourthDifference) {
            identifiedOutlier = parsedValues[0];
        } 
        // Pattern 3: Differences 1, 2, and 3 are identical. The fifth element is the outlier.
        else if (firstDifference === secondDifference && secondDifference === thirdDifference) {
            identifiedOutlier = parsedValues[4];
        } 
        // Pattern 4: A more complex pattern involving an original value and differences.
        // Original: map[2] - parseInt(dataset[0]) === map[3] && map[3] === map[4]
        //           (parsedValues[2] - parsedValues[1]) - parsedValues[0] === (parsedValues[3] - parsedValues[2]) && ...
        else if (secondDifference - parsedValues[0] === thirdDifference && thirdDifference === fourthDifference) {
            identifiedOutlier = parsedValues[1];
        } 
        // Pattern 5: Another complex pattern.
        // Original: map[1] === map[2] && map[2] === parseInt(dataset[4]) - parseInt(dataset[2])
        //           (parsedValues[1] - parsedValues[0]) === (parsedValues[2] - parsedValues[1]) && ...
        else if (firstDifference === secondDifference && secondDifference === (parsedValues[4] - parsedValues[2])) {
            identifiedOutlier = parsedValues[3];
        } 
        // Pattern 6: Final complex pattern.
        // Original: map[1] === parseInt(dataset[3]) - parseInt(dataset[1]) && map[1] === map[4]
        //           (parsedValues[1] - parsedValues[0]) === (parsedValues[3] - parsedValues[1]) && ...
        else if (firstDifference === (parsedValues[3] - parsedValues[1]) && firstDifference === fourthDifference) {
            identifiedOutlier = parsedValues[2];
        }

        // Output the identified outlier. If no pattern was matched, nothing is printed for this sequence.
        if (identifiedOutlier !== null) {
            console.log(identifiedOutlier);
        } else {
            // This block handles cases where none of the predefined patterns are detected.
            // The original code implicitly handles this by not printing anything.
            // We maintain that behavior for this clone.
            // For debugging, one might add: console.error("No specific outlier pattern found for this sequence.");
        }
    }       
});