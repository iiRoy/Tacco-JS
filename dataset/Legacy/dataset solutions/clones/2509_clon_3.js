"use strict";

const processInput = (inputString) => {
    const trimmedInput = inputString.trim();
    const inputLines = trimmedInput.split("\n");
    
    const charArrayA = inputLines[0].split("");
    const repeatCount = parseInt(inputLines[1], 10);

    let consecutiveCountA = 0;
    let consecutiveCountB = 0;
    
    const currentArrayLength = charArrayA.length;
    
    if (currentArrayLength === 1) {
        // For a single character string, the number of operations is half the repeat count.
        // Using bit shift for floor division by 2.
        console.log(repeatCount >> 1);
        return;
    }
    
    let charArrayB = [...charArrayA];
    let firstCharModified = false; // Tracks if the first character of charArrayA was modified
    
    // Phase 1: Calculate consecutiveCountA and modify charArrayA based on specific rules.
    // This loop identifies and marks consecutive identical characters in charArrayA.
    for (let idx = 0; idx < currentArrayLength - 1; ++idx) {
        const currentCharacter = charArrayA[idx];
        const nextCharacterIndex = idx + 1;
        const nextCharacter = charArrayA[nextCharacterIndex];
        
        // Check if the current and next characters are identical
        if (currentCharacter === nextCharacter) {
            // Special handling for the very last pair of characters
            if (idx === currentArrayLength - 2) {
                consecutiveCountA++;
                charArrayA[nextCharacterIndex] = "|"; // Mark the character
                continue; // Skip to the next iteration (though this is the last one)
            }
            
            // General case for consecutive characters (not the last pair)
            consecutiveCountA++;
            
            if (idx !== 0) {
                charArrayA[nextCharacterIndex] = "*"; // Mark the character
            } else {
                // Special handling for the first pair of characters
                charArrayA[idx] = "*"; // Mark the first character
                firstCharModified = true; // Indicate that the first character was involved in a modification
            }
        }
    }
    
    const initialFirstChar = charArrayA[0];
    const initialLastChar = charArrayA[currentArrayLength - 1];
    
    // Special setup for charArrayB if the first and last characters of the original string are the same
    if (initialFirstChar === initialLastChar) {
        charArrayB[0] = "@";
        charArrayB[charArrayB.length - 1] = "@";
        
        consecutiveCountB = 2; // Initialize consecutiveCountB with 2 for this special case
    }
    
    // Phase 2: Calculate consecutiveCountB and modify charArrayB.
    // This loop identifies and marks consecutive identical characters in charArrayB.
    for (let idx = 0; idx < charArrayB.length - 1; ++idx) {
        const currentCharacterB = charArrayB[idx];
        const nextCharacterBIndex = idx + 1;
        const nextCharacterB = charArrayB[nextCharacterBIndex];
        
        if (currentCharacterB === nextCharacterB) {
            consecutiveCountB++;
            charArrayB[nextCharacterBIndex] = "?"; // Mark the character
        }
    }
    
    let finalResult = 0;
    
    // Determine the final answer based on the parity of repeatCount
    const isRepeatCountEven = (repeatCount % 2) === 0;
    
    if (isRepeatCountEven) {
        const halfRepeatCount = repeatCount >> 1; // Equivalent to Math.floor(repeatCount / 2) for even numbers
        finalResult = (consecutiveCountA + consecutiveCountB) * halfRepeatCount; 
    } else {
        const ceilHalfRepeatCount = (repeatCount + 1) >> 1; // Equivalent to Math.ceil(repeatCount / 2)
        const floorHalfRepeatCount = repeatCount >> 1;       // Equivalent to Math.floor(repeatCount / 2)
        finalResult = (consecutiveCountA * ceilHalfRepeatCount) + (consecutiveCountB * floorHalfRepeatCount); 
    }

    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
