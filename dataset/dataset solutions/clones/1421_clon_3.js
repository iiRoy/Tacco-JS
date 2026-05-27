(function(sourceString) {
    let currentString = sourceString;

    const processCharacterCase = (charToEvaluate) => {
        const isLower = (charToEvaluate >= 'a' && charToEvaluate <= 'z');
        const isUpper = (charToEvaluate >= 'A' && charToEvaluate <= 'Z');

        if (isLower) {
            return charToEvaluate.toUpperCase();
        } else if (isUpper) {
            return charToEvaluate.toLowerCase();
        }
        return charToEvaluate;
    };

    const stringCharacters = currentString.split('');
    const modifiedCharacters = stringCharacters.map(processCharacterCase);
    currentString = modifiedCharacters.join('');

    console.log(currentString);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
