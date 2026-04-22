const assessSequenceDivergence = (userSuppliedText) => {
    const fixedReference = "CODEFESTIVAL2016";
    const referenceCharacters = Array.from(fixedReference);
    const suppliedCharacters = Array.from(userSuppliedText);

    if (suppliedCharacters.length < referenceCharacters.length) {
        throw new Error("Input sequence is shorter than the expected reference pattern.");
    }

    const deviationCount = referenceCharacters.reduce((accumulatedMismatches, standardChar, charIndex) => {
        const currentSuppliedChar = suppliedCharacters[charIndex];
        return accumulatedMismatches + (currentSuppliedChar !== standardChar ? 1 : 0);
    }, 0);

    return deviationCount;
};