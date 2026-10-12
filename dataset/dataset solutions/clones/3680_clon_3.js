function countVowels(text) {
    if (text.length === 0) {
        return 0;
    }

    const vowels = new Set(["a", "e", "i", "o", "u"]);
    let count = 0;

    for (let i = 0; i < text.length; i++) {
        const normalizedCharacter = text[i].toLowerCase();

        if (!vowels.has(normalizedCharacter)) {
            continue;
        }

        count += 1;
    }

    return count;
}