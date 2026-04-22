function ProcessInputData( rawInputContent ) {
    // It's good practice to ensure input is a string, though competitive programming
    // environments usually guarantee this for '/dev/stdin'.
    if (typeof rawInputContent !== 'string') {
        // For Type III, we could throw an error or handle gracefully.
        // For this context, let's assume valid string input and avoid crashing.
        console.log(""); // Output an empty line as a default "no result"
        return;
    }

    // Split the raw input string into an array of individual lines.
    const dataLines = rawInputContent.split('\n');
    
    // The very first line is expected to contain the count of subsequent data strings.
    // Use parseInt with radix for safer number conversion.
    let expectedStringCount = parseInt(dataLines[0], 10);

    // Validate the parsed count. If it's not a valid non-negative number,
    // treat it as zero strings to process, preventing errors.
    if (isNaN(expectedStringCount) || expectedStringCount < 0) {
        expectedStringCount = 0;
    }

    // This array will store each input string, converted to a sorted array of its characters.
    const characterGroupings = [];
    
    // Loop through the lines, starting from the second line (index 1),
    // up to the number of strings indicated by 'expectedStringCount'.
    for (let lineIndex = 1; lineIndex <= expectedStringCount; lineIndex++) {
        // Ensure that the current line actually exists in the input array.
        // This handles cases where expectedStringCount is greater than available lines.
        if (lineIndex < dataLines.length) {
            const currentLineText = dataLines[lineIndex].trim(); // Get the line and remove leading/trailing whitespace.
            
            // Convert the string into an array of characters and then sort it alphabetically.
            // Array.from() is a modern way to convert an iterable (like a string) to an array.
            const sortedChars = Array.from(currentLineText).sort();
            characterGroupings.push(sortedChars);
        } else {
            // If we run out of input lines prematurely, log a warning and stop processing further.
            console.warn(`Warning: Expected ${expectedStringCount} data strings, but line ${lineIndex} was not found.`);
            break; 
        }
    }
    
    let currentIntersectionBase; // This will hold the accumulated common characters.

    // If no character groupings were successfully processed, start with an empty set.
    // Otherwise, the first grouping becomes the initial base for intersection.
    if (characterGroupings.length === 0) {
        currentIntersectionBase = [];
    } else {
        currentIntersectionBase = characterGroupings.shift(); // Take the first grouping and remove it from the list.
    }

    // Recursive function to find the multiset intersection of character arrays.
    // It takes the current common set (base) and the remaining sets to compare against.
    function computeRecursiveCharIntersection( currentCommonChars, remainingCharacterSets ) {
        // Base case: If there are no more sets left to compare, the current common characters
        // represent the final intersection.
        if (remainingCharacterSets.length === 0) {
            return currentCommonChars;
        }
        
        // Get the next character set from the `remainingCharacterSets` array.
        // `shift()` modifies the array in place, removing the first element.
        const nextSetForComparison = remainingCharacterSets.shift();
        
        const intermediateCommonResult = []; // Stores common characters found in this step.
        
        // Iterate through each character in the `currentCommonChars` (our base).
        for (let baseCharIdx = 0; baseCharIdx < currentCommonChars.length; baseCharIdx++) {
            const charFromBase = currentCommonChars[baseCharIdx]; // The character we're currently looking for.
            
            // Iterate through each character in the `nextSetForComparison`.
            for (let compareCharIdx = 0; compareCharIdx < nextSetForComparison.length; compareCharIdx++) {
                const charToMatch = nextSetForComparison[compareCharIdx]; // Character from the set being compared.

                // If a match is found between a character in the base and a character in the next set.
                if (charFromBase === charToMatch) {
                    intermediateCommonResult.push(charFromBase); // Add the matched character to our intermediate result.
                    
                    // Remove the matched character from `nextSetForComparison`.
                    // This is crucial for multiset intersection, ensuring each character is used only once per set.
                    nextSetForComparison.splice(compareCharIdx, 1);
                    
                    break; // Move to the next character in `currentCommonChars` as we've found a match for `charFromBase`.
                }
            }
        }
        
        // Recursively call the function with the newly found common characters
        // and the rest of the character sets.
        return computeRecursiveCharIntersection(intermediateCommonResult, remainingCharacterSets);
    }
    
    // Initiate the recursive intersection calculation.
    const finalIntersectionResult = computeRecursiveCharIntersection(currentIntersectionBase, characterGroupings);
    
    let outputString = '';
    // If there are common characters, join them into a single string.
    if (finalIntersectionResult.length > 0) {
        outputString = finalIntersectionResult.join('');
    }
    // If `finalIntersectionResult` is empty, `outputString` remains an empty string.
    
    // Print the final result to the console. An empty string will print a newline.
    console.log(outputString);
}

// This block handles reading input from standard input, typically found in competitive programming.
// Added a try-catch for robustness, a Type III addition.
try {
    const fileSystemModule = require('fs');
    const standardInputPath = '/dev/stdin';
    const characterEncoding = 'utf8';
    
    const inputContentFromFile = fileSystemModule.readFileSync(standardInputPath, characterEncoding);
    ProcessInputData(inputContentFromFile);
} catch (ioError) {
    // In case of an error during file reading or initial processing,
    // output an empty line to conform to typical competitive programming output expectations
    // for scenarios where no valid result can be produced.
    console.log(""); 
    // console.error("An error occurred during input processing:", ioError.message); // For debugging
}