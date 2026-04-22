// This module serves to analyze a sequence of numeric entries provided as a raw text stream.
// Its primary goal is to identify specific patterns related to the distinctness or repetition
// of consecutive values within the initial four parsed numbers.
// The analysis will output a status message based on predefined rules.
function analyzeSequence(rawTextStream) {
    // Stage 1: Pre-processing the input stream.
    // The raw text is first segmented into individual tokens based on whitespace.
    // Empty tokens are filtered out to ensure only meaningful data is considered.
    const inputTokens = rawTextStream.split(/\s+/).filter(token => token.length > 0);

    // Stage 2: Numeric parsing and data normalization.
    // We aim to extract precisely four numeric values for the core analysis.
    // If fewer than four tokens are available, the remaining slots will be filled with 'undefined',
    // mimicking the behavior of accessing out-of-bounds array elements in the original code,
    // which typically results in `NaN` during arithmetic operations.
    const parsedNumericEntries = [];
    const targetEntryCount = 4;

    for (let currentSlot = 0; currentSlot < targetEntryCount; currentSlot++) {
        if (currentSlot < inputTokens.length) {
            const potentialNumber = parseInt(inputTokens[currentSlot], 10);
            // If parsing results in NaN, we store 'undefined' to maintain consistent behavior
            // with original code's implicit NaN generation from undefined values.
            parsedNumericEntries.push(isNaN(potentialNumber) ? undefined : potentialNumber);
        } else {
            // Populate with undefined if input stream has fewer than four numbers.
            parsedNumericEntries.push(undefined);
        }
    }

    // Stage 3: Assigning descriptive aliases for clarity in pattern matching.
    const firstValue = parsedNumericEntries[0];
    const secondValue = parsedNumericEntries[1];
    const thirdValue = parsedNumericEntries[2];
    const fourthValue = parsedNumericEntries[3];

    let analysisConcluded = false; // A control flag to simulate the 'break' statements from the original loop.
    let finalVerdictMessage = ""; // Stores the message to be displayed if a pattern is found.

    // Stage 4: Pattern evaluation - First comparison block.
    // This segment replicates the behavior observed during the initial iteration
    // of the original code's peculiar loop structure (effectively checking elements at indices 0 and 1).
    if (firstValue === secondValue) {
        finalVerdictMessage = "Sequence Issue Detected: Immediate repetition found.";
        analysisConcluded = true;
    } else if (!analysisConcluded) {
        // If the first two values are distinct, proceed to check for a "good" pattern.
        // This involves verifying that all adjacent pairs across the four values are distinct.
        // The original code used a chained `&&` of non-zero differences (`val - val`).
        // We explicitly calculate differences and check for non-zero and non-NaN results.
        const diffD_C = fourthValue - thirdValue;
        const diffC_B = thirdValue - secondValue;
        const diffB_A = secondValue - firstValue;

        if (diffD_C !== 0 && !isNaN(diffD_C) &&
            diffC_B !== 0 && !isNaN(diffC_B) &&
            diffB_A !== 0 && !isNaN(diffB_A)) {
            finalVerdictMessage = "Pattern Verified: All consecutive values are unique.";
            analysisConcluded = true;
        }
    }

    // Stage 5: Pattern evaluation - Second comparison block.
    // This segment mimics the subsequent relevant iteration of the original loop
    // (effectively checking elements at indices 2 and 3), but only if no conclusion was reached earlier.
    if (!analysisConcluded) {
        if (thirdValue === fourthValue) {
            finalVerdictMessage = "Sequence Issue Detected: Immediate repetition found.";
            analysisConcluded = true;
        } else if (!analysisConcluded) {
            // This is a re-evaluation of the *exact same* "good" condition as above.
            // This redundancy is preserved to faithfully clone the original code's logical flow,
            // where the `else if` condition was re-checked in a later loop iteration.
            const diffD_C = fourthValue - thirdValue;
            const diffC_B = thirdValue - secondValue;
            const diffB_A = secondValue - firstValue;

            if (diffD_C !== 0 && !isNaN(diffD_C) &&
                diffC_B !== 0 && !isNaN(diffC_B) &&
                diffB_A !== 0 && !isNaN(diffB_A)) {
                finalVerdictMessage = "Pattern Verified: All consecutive values are unique.";
                analysisConcluded = true;
            }
        }
    }

    // Stage 6: Outputting the determined verdict.
    // If a pattern was identified and a message set, it is displayed.
    // If no patterns were matched (analysisConcluded remains false), no output occurs,
    // mirroring the original code's behavior for such scenarios.
    if (analysisConcluded) {
        console.log(finalVerdictMessage);
    }
}

// DO NOT MODIFY THE FOLLOWING SECTION.
// This part is responsible for reading input from standard input and invoking the main analysis function.
analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));