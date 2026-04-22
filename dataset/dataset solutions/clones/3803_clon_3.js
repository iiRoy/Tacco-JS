// Function responsible for displaying the final computed outcome to the console.
function displayResult(computedValue) {
    console.log(computedValue);
}

// Primary function to process the incoming data stream.
function ProcessInputData(streamContent) {
    // Pre-process raw input: trim whitespace and split into individual lines.
    const inputLines = streamContent.trim().split("\n");

    // Extract the numerical count of elements and the sequence string from the parsed lines.
    // Convert the first line (element count) from string to a numeric type.
    const numberOfElements = Number(inputLines[0]);
    const sequenceString = inputLines[1];

    // --- Type III Addition: Input validation and early exit conditions ---
    // Validate the number of elements; it must be non-negative.
    if (numberOfElements < 0) {
        displayResult("Error: The specified number of elements cannot be negative.");
        return; // Terminate execution for invalid input.
    }
    // Check if the sequence string is provided and its length matches the declared count.
    if (!sequenceString || sequenceString.length !== numberOfElements) {
        displayResult("Error: The sequence string is malformed or its length does not match the element count.");
        return; // Terminate execution for inconsistent input.
    }
    // If there are no elements, the minimum operations required is zero.
    if (numberOfElements === 0) {
        displayResult(0);
        return;
    }
    // --- End Type III Addition ---

    let currentWestAccumulator = 0; // Accumulates 'W' counts from the start.
    // Pre-allocate an array to store prefix sums of 'W's for efficiency.
    const westDirectionPrefixSums = new Array(numberOfElements);
    let totalEastOccurrences = 0; // Tracks the total number of 'E's in the entire sequence.

    // First iteration: Populate prefix sums for 'W's and calculate total 'E's.
    for (let currentIndex = 0; currentIndex < numberOfElements; currentIndex++) {
        // Access character using charAt for direct access.
        const currentCharacter = sequenceString.charAt(currentIndex);
        if (currentCharacter === "W") {
            currentWestAccumulator++;
        } else {
            totalEastOccurrences++; // Increment total 'E' count.
        }
        westDirectionPrefixSums[currentIndex] = currentWestAccumulator;
    }

    // Pre-allocate an array for suffix counts of 'E's.
    const eastDirectionSuffixCounts = new Array(numberOfElements);
    let eastCountFromRight = totalEastOccurrences; // Initialize with the total 'E's.

    // Second iteration: Calculate suffix counts for 'E's.
    // `eastDirectionSuffixCounts[currentIndex]` will store the number of 'E's strictly after `currentIndex`.
    for (let currentIndex = 0; currentIndex < numberOfElements; currentIndex++) {
        const currentCharacter = sequenceString.charAt(currentIndex);
        if (currentCharacter === "E") {
            eastCountFromRight--; // Decrement if the current character is an 'E'.
        }
        eastDirectionSuffixCounts[currentIndex] = eastCountFromRight;
    }

    // --- Type III Addition: Initialize minimum cost with global boundary cases ---
    // The minimum operations could be turning everyone East (cost = total 'W's) or everyone West (cost = total 'E's).
    let minimumTransformationsRequired = Math.min(currentWestAccumulator, totalEastOccurrences);
    // --- End Type III Addition ---

    // Third iteration: Evaluate each internal split point to find the true minimum.
    // The `currentIndex` represents a pivot point. The cost is calculated for 'W's to its left
    // and 'E's to its right, effectively ignoring the pivot itself for the count.
    for (let currentIndex = 0; currentIndex < numberOfElements; currentIndex++) {
        let currentLeftWestCount = westDirectionPrefixSums[currentIndex];
        const pivotCharacter = sequenceString.charAt(currentIndex);

        // Adjust the 'W' count for the left segment (elements from 0 to currentIndex-1).
        // If the pivot character is 'W', it is not considered part of the 'left' group for this specific calculation.
        if (pivotCharacter === "W") {
            currentLeftWestCount--;
        }

        // Calculate the total cost for the current split configuration.
        // This sum represents (W's strictly to the left of currentIndex) + (E's strictly to the right of currentIndex).
        const calculatedCostForSplit = currentLeftWestCount + eastDirectionSuffixCounts[currentIndex];

        // Update the overall minimum cost if a smaller value is found.
        minimumTransformationsRequired = Math.min(minimumTransformationsRequired, calculatedCostForSplit);
    }
    
    // Output the final minimum number of transformations.
    displayResult(minimumTransformationsRequired);
}

// Initiate the processing by reading input from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());