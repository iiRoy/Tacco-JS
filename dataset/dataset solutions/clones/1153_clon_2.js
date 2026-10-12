function containsCompleteAlphabet(inputSentence) {
    const lowercaseSentence = inputSentence.toLowerCase();
    const registeredCharacters = new Array(26).fill(false);

    let distinctCharacterAmount = 0;

    for (
        let currentIndex = 0;
        currentIndex < lowercaseSentence.length;
        currentIndex++
    ) {
        const currentCharacterCode =
            lowercaseSentence.charCodeAt(currentIndex);

        if (
            currentCharacterCode < 97 ||
            currentCharacterCode > 122
        ) {
            continue;
        }

        const alphabetIndex = currentCharacterCode - 97;

        if (registeredCharacters[alphabetIndex]) {
            continue;
        }

        registeredCharacters[alphabetIndex] = true;
        distinctCharacterAmount++;

        if (distinctCharacterAmount === 26) {
            return true;
        }
    }

    return false;
}