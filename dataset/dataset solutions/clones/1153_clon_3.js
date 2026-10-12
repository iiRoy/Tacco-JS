function isPangram(text) {
    if (text.length < 26) {
        return false;
    }

    const discoveredLetters = new Set();
    const normalizedText = text.toLowerCase();

    for (const character of normalizedText) {
        const isEnglishLetter =
            character >= "a" &&
            character <= "z";

        if (!isEnglishLetter) {
            continue;
        }

        discoveredLetters.add(character);

        if (discoveredLetters.size === 26) {
            return true;
        }
    }

    return discoveredLetters.size === 26;
}