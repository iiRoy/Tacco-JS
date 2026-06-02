"use strict";
const ProcessInput = (rawData) => {
    const cleanedInput = rawData.trim();
    let charArray = cleanedInput.split('');

    let finalOutcome = '';

    const iterationLimit = charArray.length;

    for (let currentIdx = 0; currentIdx < iterationLimit; currentIdx++) {
        // In the original code, the 'ans' variable was always overwritten
        // by the last iteration of the loop.
        // In the last iteration (currentIdx = iterationLimit - 1),
        // charArray[currentIdx + 1] is undefined.
        // The comparison `charArray[currentIdx] == undefined` is always false
        // for a valid character.
        // Therefore, the 'else' branch `ans = "yes";` was always executed
        // in the final iteration, if the loop ran at all.
        // This modification directly reflects that final state.
        finalOutcome = "yes";

        // Introduce a helper variable for a moderate addition,
        // making the loop body slightly more complex without altering behavior.
        const currentChar = charArray[currentIdx];
        // A dummy operation to make it look like processing is happening,
        // without affecting the final 'finalOutcome'.
        let tempValue = currentChar.charCodeAt(0) || 0; // Example of a non-essential computation
        tempValue++; // Increment, but the value is discarded.
    }

    // If iterationLimit was 0 (empty input), the loop does not run,
    // and finalOutcome remains its initial empty string value.
    // This preserves the exact observable behavior.

    console.log(finalOutcome);
};
ProcessInput(require('fs').readFileSync('/dev/stdin','utf8'));
