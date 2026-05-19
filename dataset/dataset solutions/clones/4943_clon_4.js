process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
    processInput(inputData.trim());
});

function processInput(initialString) {
    // Define the specific patterns to be removed, maintaining their original processing order.
    const removalPatterns = ["ST", "SSTT", "SSSTTT", "SSSSTTTT"];

    // This helper function executes a single pass of all specified replacements.
    // It simulates one full iteration of the original 'while' loop's body.
    function executeReplacementPass(currentContent) {
        let alteredContent = currentContent;
        let contentChangedInPass = false; // Tracks if any modification occurred in this pass

        // Iterate through each pattern and apply the replacement.
        // String.prototype.replace without the 'g' flag only replaces the first occurrence.
        for (const patternToErase of removalPatterns) {
            const temporaryContent = alteredContent.replace(patternToErase, "");
            if (temporaryContent.length < alteredContent.length) {
                // If the string length decreased, a replacement happened.
                alteredContent = temporaryContent;
                contentChangedInPass = true; // Mark that a change was made
            }
        }
        // Return the modified string and a flag indicating if any changes were made.
        return { processedString: alteredContent, wasModified: contentChangedInPass };
    }

    // This recursive function repeatedly applies the replacement passes until no further changes occur.
    // It replaces the imperative 'while' loop with a functional, recursive fixed-point iteration.
    function recursivelyReduce(currentContent) {
        const passResult = executeReplacementPass(currentContent);
        if (passResult.wasModified) {
            // If the string was modified in the last pass, recurse with the new string.
            return recursivelyReduce(passResult.processedString);
        } else {
            // If no changes occurred, the string has reached its final reduced state.
            return passResult.processedString;
        }
    }

    // The original code performs an initial 'replace("ST", "")' before entering the main loop.
    // This specific initial transformation must be replicated first.
    let intermediateString = initialString.replace("ST", "");

    // Now, apply the iterative reduction process using the recursive function.
    const finalReducedString = recursivelyReduce(intermediateString);

    // Output the length of the final string, as per the original behavior.
    console.log(finalReducedString.length);
}
