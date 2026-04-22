// This function processes a string of parentheses to balance it according to specific rules.
// It reads the total length and the sequence of characters, then analyzes and modifies
// the counts of consecutive identical characters to achieve a balanced output.
function ProcessParenthesesSequence(sourceData) {
    // Perform initial validation on the raw input data.
    // Ensure the input is a valid string and contains content.
    if (typeof sourceData !== 'string' || sourceData.trim().length === 0) {
        // In a production environment, one might throw an error or log more verbosely.
        console.error("Input data must be a non-empty string. Aborting processing.");
        return ""; // Return an empty string to indicate failure or no output.
    }

    // Split the entire input block by newline characters.
    // The first line typically contains the length, and the second contains the character sequence.
    const inputLines = sourceData.split("\n");

    // Validate that the input contains at least the expected number of lines.
    if (inputLines.length < 2) {
        console.error("Insufficient input lines provided. Expected at least two lines.");
        return "";
    }

    // Convert the first line to a number, representing the total count of characters in the sequence.
    // Using Number() for explicit type conversion, which also handles potential whitespace.
    const totalCharacterCount = Number(inputLines[0]);

    // Validate the parsed character count to ensure it's a positive integer.
    if (isNaN(totalCharacterCount) || totalCharacterCount <= 0) {
        console.error("Invalid or non-positive character count detected. Cannot proceed.");
        return "";
    }

    // Transform the second line (the string of parentheses) into an array of individual characters.
    // This allows for easier character-by-character processing.
    const characterSequence = Array.from(inputLines[1]);

    // Optional: Add a warning if the declared count doesn't match the actual sequence length.
    // Depending on requirements, this could be an error that halts execution.
    if (characterSequence.length !== totalCharacterCount) {
        console.warn(`Mismatch: Declared length (${totalCharacterCount}) differs from actual sequence length (${characterSequence.length}). Processing with actual length.`);
        // For this specific problem, it's safer to proceed with the actual length if mismatch.
        // Or, one might reassign totalCharacterCount = characterSequence.length;
    }

    // This array will store the lengths of consecutive segments of identical parentheses.
    // For example, "((()))" might be represented as [3, 3] if starting with '('.
    // It's initialized with 'totalCharacterCount + 1' elements, all set to zero.
    // The extra element accommodates potential adjustments for balancing.
    const segmentLengths = new Array(totalCharacterCount + 1).fill(0);

    // This variable keeps track of the current active index within the 'segmentLengths' array.
    let currentSegmentIndex = 0;

    // A boolean flag to specifically note if the input sequence begins with a closing parenthesis.
    // This affects how the initial segments are mapped into 'segmentLengths'.
    let startsWithClosingParenthesis = false;

    // Define constants for clarity and maintainability.
    const OPEN_PAREN = '(';
    const CLOSE_PAREN = ')';

    // Process the very first character of the sequence to establish the initial segment.
    if (characterSequence[0] === CLOSE_PAREN) {
        // If the sequence starts with a closing parenthesis, we offset the segment index.
        // 'segmentLengths[0]' remains zero, implicitly reserved for potential leading '(' additions.
        currentSegmentIndex = 1;
        startsWithClosingParenthesis = true;
        segmentLengths[currentSegmentIndex]++; // Increment count for the first segment (at index 1).
    } else if (characterSequence[0] === OPEN_PAREN) {
        // If it starts with an opening parenthesis, it's the very first segment.
        segmentLengths[currentSegmentIndex]++; // Increment count for the first segment (at index 0).
    } else {
        // A robust solution might throw an error for unexpected characters.
        console.error("Invalid starting character detected in the sequence. Expected '(' or ')'.");
        return "";
    }

    // Iterate through the rest of the character sequence (from the second character onwards).
    // The goal is to aggregate consecutive identical characters into segments.
    for (let charPosition = 1; charPosition < totalCharacterCount; ++charPosition) {
        // Compare the current character with the preceding one.
        if (characterSequence[charPosition] === characterSequence[charPosition - 1]) {
            // If they are the same, extend the current segment by incrementing its count.
            segmentLengths[currentSegmentIndex]++;
        } else {
            // If they are different, a new segment has begun.
            // Move to the next index in 'segmentLengths' and start counting for the new segment.
            currentSegmentIndex++;
            segmentLengths[currentSegmentIndex]++;
        }
    }

    // --- Core Balancing Logic ---
    // This section calculates and applies adjustments to 'segmentLengths' to balance the parentheses.
    // Even indices in 'segmentLengths' are conceptually associated with '(' groups, and odd with ')' groups.
    let cumulativeBalanceDifference = 0; // Tracks the overall imbalance.

    // Iterate through the 'segmentLengths' array in pairs (even index vs. odd index).
    // This simulates comparing groups of opening and closing parentheses.
    for (let i = 0; i < totalCharacterCount; i += 2) {
        const currentOpenGroupCount = segmentLengths[i];
        const currentCloseGroupCount = segmentLengths[i + 1]; // This might be zero if no corresponding group exists.
        // Add the difference between the 'open' and 'close' groups to the cumulative balance.
        cumulativeBalanceDifference += (currentOpenGroupCount - currentCloseGroupCount);
    }

    // Initialize the string that will hold the final, balanced output.
    let balancedOutputString = "";

    // Apply adjustments to 'segmentLengths' based on the 'cumulativeBalanceDifference'.
    if (cumulativeBalanceDifference < 0) {
        // Case 1: Overall excess of closing parentheses.
        // To balance, add an equivalent number of opening parentheses to the very first segment.
        // Subtracting a negative 'cumulativeBalanceDifference' effectively adds its absolute value.
        segmentLengths[0] -= cumulativeBalanceDifference;
    } else if (cumulativeBalanceDifference > 0) {
        // Case 2: Overall excess of opening parentheses.
        const initialSegmentImbalance = segmentLengths[0] - segmentLengths[1];

        if (initialSegmentImbalance < 0) {
            // Special sub-case: If the initial opening group is smaller than the initial closing group.
            // Adjust 'cumulativeBalanceDifference' to account for this initial deficit.
            // Then, make the first opening group's count equal to the first closing group's count.
            cumulativeBalanceDifference += Math.abs(initialSegmentImbalance);
            segmentLengths[0] = segmentLengths[1];
        }

        // Find the last non-zero segment in the array, starting from the end.
        let reverseTraversalIndex = totalCharacterCount;
        while (reverseTraversalIndex >= 0) {
            if (segmentLengths[reverseTraversalIndex] > 0) {
                // Once the last active segment is found, apply the 'cumulativeBalanceDifference'.
                if (reverseTraversalIndex % 2 === 0) {
                    // If it's an opening parenthesis group (even index), add to the *next* closing group.
                    segmentLengths[reverseTraversalIndex + 1] += cumulativeBalanceDifference;
                } else {
                    // If it's a closing parenthesis group (odd index), add to *this* closing group.
                    segmentLengths[reverseTraversalIndex] += cumulativeBalanceDifference;
                }
                break; // Exit the loop as the adjustment is made.
            }
            reverseTraversalIndex--; // Move to the previous segment.
        }
    } else { // Case 3: 'cumulativeBalanceDifference' is 0 (overall balance is achieved).
        const initialSegmentImbalance = segmentLengths[0] - segmentLengths[1];

        if (initialSegmentImbalance < 0) {
            // Even if the overall balance is zero, there might be a local imbalance at the start.
            // This handles specific edge cases where segmentLengths[0] is smaller than segmentLengths[1].
            const magnitudeOfImbalance = Math.abs(initialSegmentImbalance);
            segmentLengths[0] = segmentLengths[1]; // Ensure the first opening group matches the first closing group.

            // Find the last active segment to apply any remaining local imbalance.
            let reverseTraversalIndex = totalCharacterCount;
            while (reverseTraversalIndex >= 0) {
                if (segmentLengths[reverseTraversalIndex] > 0) {
                    if (reverseTraversalIndex % 2 === 0) {
                        // If the last active group is '(', make the next ')' group equal to it.
                        segmentLengths[reverseTraversalIndex + 1] = segmentLengths[reverseTraversalIndex];
                    } else {
                        // If the last active group is ')', add the magnitude of the initial imbalance to it.
                        segmentLengths[reverseTraversalIndex] += magnitudeOfImbalance;
                    }
                    break;
                }
                reverseTraversalIndex--;
            }
        }
    }

    // Construct the final balanced string by iterating through the (now adjusted) segment lengths.
    // The loop iterates up to `totalCharacterCount + 1` to cover all potential segments,
    // including those that might have been added or expanded during balancing.
    for (let currentSegmentPosition = 0; currentSegmentPosition < totalCharacterCount + 1; ++currentSegmentPosition) {
        const segmentCharactersCount = segmentLengths[currentSegmentPosition];
        // Only append characters if the segment actually has a positive count.
        if (segmentCharactersCount > 0) {
            if (currentSegmentPosition % 2 === 0) {
                // Even indices correspond to opening parentheses.
                balancedOutputString += OPEN_PAREN.repeat(segmentCharactersCount);
            } else {
                // Odd indices correspond to closing parentheses.
                balancedOutputString += CLOSE_PAREN.repeat(segmentCharactersCount);
            }
        }
    }

    // Output the computed balanced string to the console.
    console.log(balancedOutputString);

    // Return the generated string for potential further use or testing.
    return balancedOutputString;
}

// This line serves as the entry point for execution, typically in a competitive programming setup.
// It reads the entire content from standard input (e.g., from a file or piped input) as UTF-8.
ProcessParenthesesSequence(require("fs").readFileSync("/dev/stdin", "utf8"));