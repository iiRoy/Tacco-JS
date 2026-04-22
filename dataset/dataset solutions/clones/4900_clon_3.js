const initialSourceData = "FFFFdfadadadfd"; // Initial string content for processing.

/**
 * Examines a provided character sequence to identify a specific sequential pattern.
 * This function determines if the character 'F' appears at any point after
 * the character 'C' has already been encountered within the input string.
 *
 * @param {string} inputSequenceToAnalyze The string that needs to be scanned for the pattern.
 * @returns {boolean} Returns `true` if the 'F' after 'C' pattern is found, otherwise `false`.
 */
function evaluateCharacterSeries(inputSequenceToAnalyze) {
    // Type III: Added a guard clause for handling empty or invalid input.
    if (typeof inputSequenceToAnalyze !== 'string' || inputSequenceToAnalyze.length === 0) {
        // console.warn("Evaluation skipped: Input sequence is empty or not a valid string.");
        return false;
    }

    // Type III: Localizing and renaming flags from original global scope.
    // 'cflag' concept becomes 'hasFoundC'.
    let hasFoundC = false;
    // 'fflag' concept becomes 'hasFoundF', now actively used to track if 'F' was ever found.
    let hasFoundF = false;

    // Type III: Converting the string to an array of characters using a different method (`Array.from`).
    const characterElements = Array.from(inputSequenceToAnalyze);

    // Type III: Added introductory logging for clarity.
    // console.info(`Initiating pattern search for sequence: "${inputSequenceToAnalyze}"`);
    // console.debug(`Processing a total of ${characterElements.length} characters.`);

    // Type III: Using a `for...of` loop for cleaner iteration over characters,
    // and renaming the loop variable (Type II).
    for (const currentCharacterValue of characterElements) {
        // Type III: Added intermediate logging for each character.
        // console.trace(`Analyzing character: '${currentCharacterValue}'`);

        // Type II: Renamed identifier, using strict equality.
        if (currentCharacterValue === 'C') {
            hasFoundC = true;
            // Type III: Added a specific log for state change.
            // console.info("'C' encountered. Flagging 'hasFoundC' as true.");
        }

        // Type II: Renamed identifiers, using direct boolean check.
        // Type III: 'hasFoundF' now tracks general 'F' presence.
        // The core pattern detection logic remains: 'F' must appear *after* 'C'.
        if (currentCharacterValue === 'F') {
            hasFoundF = true; // Mark that 'F' has been seen at least once.
            if (hasFoundC) {
                // Type III: Added an explicit message for early exit.
                // console.log("Success: Pattern 'F after C' identified. Terminating search.");
                return true; // Pattern found, immediate exit.
            }
        }
    }

    // Type III: Refined final return logic.
    // If the loop completes without returning `true`, the pattern was not found.
    // The original's final `if(cflag != true && fflag != true)` was effectively `if(!cflag)`
    // since `fflag` was always false. This revised logic explicitly covers all cases.
    // console.info("Pattern 'F after C' was not identified after scanning the entire sequence.");

    // Type III: Added supplementary information based on the flags,
    // which serves as an added code fragment demonstrating intermediate state.
    /*
    if (hasFoundC && !hasFoundF) {
        console.warn("Note: 'C' was present, but 'F' never appeared after it.");
    } else if (!hasFoundC && hasFoundF) {
        console.warn("Note: 'F' was present, but 'C' never appeared before it.");
    } else if (!hasFoundC && !hasFoundF) {
        console.warn("Note: Neither 'C' nor 'F' were found in the sequence.");
    }
    */

    return false; // If execution reaches here, the pattern was not found.
}

// Type III: Storing the result in a descriptive variable and logging it.
const finalEvaluationOutcome = evaluateCharacterSeries(initialSourceData);
// console.log(`The final outcome of the sequence evaluation is: ${finalEvaluationOutcome}`);

// Type III: Calling the function with an empty string to demonstrate the guard clause.
// const emptyStringResult = evaluateCharacterSeries("");
// console.log(`Evaluation for empty string: ${emptyStringResult}`);

// Type III: An alternative call with a different string to show varied behavior.
// const anotherStringResult = evaluateCharacterSeries("ACFGH");
// console.log(`Evaluation for "ACFGH": ${anotherStringResult}`);

// The original global variables `sArr`, `cflag`, `fflag` are now entirely removed
// from the global scope, as the function `evaluateCharacterSeries` is self-contained.
// This represents a "deletion" of non-essential global state and a structural improvement.

// To ensure the function is actually called as in the original, but with the new name.
evaluateCharacterSeries(initialSourceData);