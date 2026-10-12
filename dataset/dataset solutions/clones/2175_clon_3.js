function areAnagrams(firstWord, secondWord) {
    if (firstWord.length !== secondWord.length) {
        return false;
    }

    const frequencies = new Map();

    for (const character of firstWord) {
        const previousAmount = frequencies.get(character) ?? 0;
        frequencies.set(character, previousAmount + 1);
    }

    for (const character of secondWord) {
        const remainingAmount =
            (frequencies.get(character) ?? 0) - 1;

        if (remainingAmount < 0) {
            return false;
        }

        frequencies.set(character, remainingAmount);
    }

    return true;
}