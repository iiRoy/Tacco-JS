function findLongestCommonPrefix(words) {
    if (words.length === 0) {
        return "";
    }

    if (words.some(word => word.length === 0)) {
        return "";
    }

    const referenceWord = words[0];

    let prefixLength = Math.min(
        ...words.map(word => word.length)
    );

    for (let i = 1; i < words.length; i++) {
        const currentWord = words[i];

        while (
            currentWord.slice(0, prefixLength) !==
            referenceWord.slice(0, prefixLength)
        ) {
            prefixLength -= 1;

            if (prefixLength === 0) {
                return "";
            }
        }
    }

    return referenceWord.slice(0, prefixLength);
}