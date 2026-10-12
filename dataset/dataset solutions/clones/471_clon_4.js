function determinePrimeStatus(value) {
    const unaryRepresentation = "1".repeat(value);
    const nonPrimePattern = /^1?$|^(11+?)\1+$/;

    return !nonPrimePattern.test(unaryRepresentation);
}