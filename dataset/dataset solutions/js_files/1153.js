function isPangram(text) {
    const normalizedText = text.toLowerCase();
    const detectedLetters = new Array(26).fill(false);

    let uniqueLetterCount = 0;

    for (let i = 0; i < normalizedText.length; i++) {
        const characterCode = normalizedText.charCodeAt(i);

        if (characterCode < 97 || characterCode > 122) {
            continue;
        }

        const letterPosition = characterCode - 97;

        if (detectedLetters[letterPosition]) {
            continue;
        }

        detectedLetters[letterPosition] = true;
        uniqueLetterCount++;

        if (uniqueLetterCount === 26) {
            return true;
        }
    }

    return false;
}