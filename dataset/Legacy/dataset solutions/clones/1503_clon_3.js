function processInput(rawData) {
    const NEWLINE_DELIMITER = '\n';
    const EMPTY_STRING_DELIMITER = '';
    const LAST_CHAR_TO_CHECK = 's';
    const SUFFIX_FOR_S = ['e', 's'];
    const DEFAULT_SUFFIX = ['s'];

    let firstLineOfInput = rawData.split(NEWLINE_DELIMITER)[0];
    let trimmedInputLine = firstLineOfInput.trim();
    let characterArray = trimmedInputLine.split(EMPTY_STRING_DELIMITER);

    let lastElement = characterArray[characterArray.length - 1];
    let chosenSuffixCharacters;

    if (lastElement === LAST_CHAR_TO_CHECK) {
        chosenSuffixCharacters = SUFFIX_FOR_S;
    } else {
        chosenSuffixCharacters = DEFAULT_SUFFIX;
    }

    characterArray.push(...chosenSuffixCharacters);

    console.log(characterArray.join(EMPTY_STRING_DELIMITER));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
