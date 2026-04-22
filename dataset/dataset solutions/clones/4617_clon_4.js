function deriveInitials(incomingData) {
    const removeOuterSpaces = (textValue) => {
        return textValue.replace(/^\s+|\s+$/g, '');
    };

    const convertCharToUppercase = (charUnit) => {
        const charCodeValue = charUnit.charCodeAt(0);
        // Check if the character is a lowercase letter (ASCII 'a' to 'z')
        if (charCodeValue >= 97 && charCodeValue <= 122) {
            return String.fromCharCode(charCodeValue - 32); // Convert to uppercase
        }
        return charUnit; // Return as is if not a lowercase letter
    };

    let processedText = removeOuterSpaces(incomingData);
    let collectedLetters = [];
    let currentScanPosition = 0;
    let segmentCounter = 0;

    while (segmentCounter < 3 && currentScanPosition < processedText.length) {
        // Skip any leading spaces to find the start of the next word
        while (currentScanPosition < processedText.length && processedText[currentScanPosition] === ' ') {
            currentScanPosition++;
        }

        // If we found a non-space character (start of a word)
        if (currentScanPosition < processedText.length) {
            collectedLetters.push(convertCharToUppercase(processedText[currentScanPosition]));
            segmentCounter++;

            // Move currentScanPosition past the current word
            while (currentScanPosition < processedText.length && processedText[currentScanPosition] !== ' ') {
                currentScanPosition++;
            }
        }
    }
    console.log(collectedLetters.join(''));
}

deriveInitials(require('fs').readFileSync('/dev/stdin', 'utf8'));