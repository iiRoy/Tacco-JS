function determineVowelFrequency(source) {
    const detectedVowels = source.match(/[aeiou]/gi);

    return detectedVowels === null
        ? 0
        : detectedVowels.length;
}