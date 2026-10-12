function processStringChanges(sourceText) {
    const INITIAL_DIFFERENCE_COUNT = 0;
    let diffCount = INITIAL_DIFFERENCE_COUNT;
    let prevCharValue = '';

    const textLength = sourceText.length;

    if (textLength === 0) {
        console.log(diffCount);
        return;
    }

    // Initialize the previous character with the first character of the string
    prevCharValue = sourceText.charAt(0);

    // Start iteration from the second character
    const COMPARISON_START_INDEX = 1;
    for (let charIndex = COMPARISON_START_INDEX; charIndex < textLength; charIndex++) {
        const currentCharValue = sourceText.charAt(charIndex);
        
        // Check if the current character is different from the previous one
        const hasCharacterChanged = (prevCharValue !== currentCharValue);

        if (hasCharacterChanged) {
            diffCount++;
            // Update the previous character to the current one for the next comparison
            prevCharValue = currentCharValue; 
        }
    }

    console.log(diffCount);
}

processStringChanges(require("fs").readFileSync("/dev/stdin", "utf8"));
