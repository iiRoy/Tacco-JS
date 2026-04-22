const processDirectionData = function(rawInputContent) {
    // Initial data processing and validation.
    // This serves as a guard clause for potentially empty or malformed input.
    if (!rawInputContent || rawInputContent.trim() === '') {
        console.error("Input data is empty or invalid. Returning default zero flips.");
        return 0; // In competitive programming, 0 might be expected for an empty sequence.
    }

    // Split the raw input string into an array of lines.
    const inputLines = rawInputContent.trim().split('\n');

    // The first line typically specifies the length of the sequence,
    // but we will explicitly derive it from the sequence string itself for robustness.
    // This line is consumed but its value is not directly used for loop bounds,
    // which is a slight departure from the original's explicit 'N' usage.
    const redundantLengthSpecifier = inputLines.shift(); 
    
    // The actual sequence of 'W' and 'E' orientations is expected on the subsequent line(s).
    // We join remaining lines in case the sequence spans multiple lines, though typically it's one.
    const orientationSequence = inputLines.join(''); 

    // Validate if the parsed orientation sequence itself is empty.
    // If so, there are no participants, thus no adjustments needed.
    if (orientationSequence.length === 0) {
        return 0;
    }

    // Store the total number of individuals in the sequence for clearer readability.
    const sequenceTotalLength = orientationSequence.length;

    // Helper function to count occurrences of a specific character within a string segment.
    // This rewrites the original `split('X').join('')` character counting method
    // into an explicit loop, satisfying a Type III structural change.
    const countCharacterOccurrences = (segmentToCheck, charToMatch) => {
        let matchedCharCount = 0;
        for (let position = 0; position < segmentToCheck.length; position++) {
            if (segmentToCheck[position] === charToMatch) {
                matchedCharCount++;
            }
        }
        return matchedCharCount;
    };

    // Initialize the variable to track the minimum number of necessary adjustments (flips).
    // Using Number.MAX_SAFE_INTEGER instead of an arbitrary large number for better practice.
    let minimumRequiredFlips = Number.MAX_SAFE_INTEGER;

    // Iterate through all possible split points (pivot indices) in the sequence.
    // The loop runs from 1 to `sequenceTotalLength - 1`,
    // effectively skipping the character at `pivotIndex`.
    // This means the leftmost character (`index 0`) and rightmost character
    // (`index sequenceTotalLength - 1`) are always part of a segment,
    // never the "skipped" character.
    for (let pivotIndex = 1; pivotIndex < sequenceTotalLength; ++pivotIndex) {
        // Extract the left segment (from start up to, but not including, pivotIndex).
        const leftPeopleGroup = orientationSequence.substring(0, pivotIndex);
        
        // Extract the right segment (from after pivotIndex to the end of the sequence).
        const rightPeopleGroup = orientationSequence.substring(pivotIndex + 1, sequenceTotalLength);

        // Count individuals facing East ('E') in the left group.
        // These are considered misaligned if the left group is designated 'West'.
        const eastFacingInLeft = countCharacterOccurrences(leftPeopleGroup, 'E');

        // Count individuals facing West ('W') in the right group.
        // These are considered misaligned if the right group is designated 'East'.
        const westFacingInRight = countCharacterOccurrences(rightPeopleGroup, 'W');

        // Calculate the total misalignment for the current pivot point.
        const currentTotalMisalignment = eastFacingInLeft + westFacingInRight;

        // Optimization: if perfect alignment (0 flips) is found, it's the absolute minimum.
        // We can immediately update the minimum and exit the loop.
        if (currentTotalMisalignment === 0) {
            minimumRequiredFlips = 0;
            break; 
        }

        // If the current misalignment is less than the previously recorded minimum, update it.
        if (currentTotalMisalignment < minimumRequiredFlips) {
            minimumRequiredFlips = currentTotalMisalignment;
        }
    }

    // Display the final calculated minimum adjustments to the console.
    console.log(minimumRequiredFlips);

    // Return the result of the calculation.
    return minimumRequiredFlips;
};

// Execute the primary function with input read from standard input.
// The `trim()` method ensures leading/trailing whitespace is removed from the raw input.
processDirectionData(require("fs").readFileSync("/dev/stdin", "utf8").trim());