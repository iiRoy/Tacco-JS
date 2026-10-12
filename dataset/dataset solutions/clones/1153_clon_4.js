function verifyAlphabetCoverage(sentence) {
    const lowercaseInput = sentence.toLowerCase();

    const completeAlphabetMask =
        (1 << 26) - 1;

    let observedLetterMask = 0;

    for (const symbol of lowercaseInput) {
        const alphabetPosition =
            symbol.charCodeAt(0) -
            "a".charCodeAt(0);

        if (
            alphabetPosition < 0 ||
            alphabetPosition >= 26
        ) {
            continue;
        }

        observedLetterMask |=
            1 << alphabetPosition;
    }

    return observedLetterMask === completeAlphabetMask;
}