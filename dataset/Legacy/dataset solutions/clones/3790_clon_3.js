function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const stringLength = parseInt(inputLines[0], 10);
    const targetString = inputLines[1];

    const ALPHABET_SIZE = 26;
    const ASCII_LOWERCASE_A = 97;

    const firstOccurrences = new Array(ALPHABET_SIZE);
    const lastOccurrencesExclusive = new Array(ALPHABET_SIZE);

    for (let charAlphabetIndex = 0; charAlphabetIndex < ALPHABET_SIZE; charAlphabetIndex++) {
        let currentFirstIndex = 0;
        while (currentFirstIndex < stringLength) {
            if (targetString.charCodeAt(currentFirstIndex) === charAlphabetIndex + ASCII_LOWERCASE_A) {
                break;
            }
            currentFirstIndex++;
        }
        firstOccurrences[charAlphabetIndex] = currentFirstIndex;

        let currentLastIndex = stringLength;
        while (currentLastIndex >= currentFirstIndex) {
            if (targetString.charCodeAt(currentLastIndex) === charAlphabetIndex + ASCII_LOWERCASE_A) {
                break;
            }
            currentLastIndex--;
        }
        lastOccurrencesExclusive[charAlphabetIndex] = currentLastIndex;
    }

    const isPositionCoveredByChar = (position, charFirstIndex, charLastIndex) => {
        return position >= charFirstIndex && position < charLastIndex;
    };

    let maxDistinctChars = 0;
    for (let currentPosition = 0; currentPosition < stringLength; currentPosition++) {
        let distinctCharCount = 0;
        for (let alphabetIterator = 0; alphabetIterator < ALPHABET_SIZE; alphabetIterator++) {
            if (isPositionCoveredByChar(
                currentPosition,
                firstOccurrences[alphabetIterator],
                lastOccurrencesExclusive[alphabetIterator]
            )) {
                distinctCharCount++;
            }
        }
        maxDistinctChars = Math.max(maxDistinctChars, distinctCharCount);
    }

    console.log('%d', maxDistinctChars);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
