function Main(inputString) {
    if (inputString.charCodeAt(0) !== 65) { // Check if the first character is 'A' (ASCII 65)
        console.log('WA');
        return;
    }

    // The shortest string that can be 'AC' is "AxCy" (length 4).
    // 'A' at index 0, 'C' at index 2, and other two characters lowercase.
    // If the string is shorter than 4, it cannot satisfy the conditions.
    if (inputString.length < 4) {
        console.log('WA');
        return;
    }

    // Use a functional approach with Array.prototype.reduce to process the string
    // from the second character (index 1) to the end.
    // The accumulator will track the necessary conditions.
    const evaluationResult = Array.from(inputString).slice(1).reduce((accumulator, currentCharacter, relativeIndex) => {
        // 'relativeIndex' is the index within the sliced array (starting from 0).
        // 'originalIndex' is the index within the full 'inputString'.
        const originalIndex = relativeIndex + 1;

        if (currentCharacter.charCodeAt(0) === 67) { // Check if the character is 'C' (ASCII 67)
            accumulator.cCount++;
            // 'C' must be located at an index from 2 up to (length - 2).
            // This means 'C' cannot be at index 1 or the last index (length - 1).
            if (originalIndex < 2 || originalIndex > inputString.length - 2) {
                accumulator.cPositionValid = false;
            }
        } else {
            // Check if the character is a lowercase English letter (ASCII 97-122)
            if (currentCharacter.charCodeAt(0) < 97 || currentCharacter.charCodeAt(0) > 122) {
                accumulator.allOthersLowercase = false;
            }
        }
        return accumulator;
    }, {
        cCount: 0,
        cPositionValid: true,
        allOthersLowercase: true
    });

    // Final evaluation based on the accumulated state
    if (evaluationResult.cCount === 1 &&
        evaluationResult.cPositionValid &&
        evaluationResult.allOthersLowercase) {
        console.log('AC');
    } else {
        console.log('WA');
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
