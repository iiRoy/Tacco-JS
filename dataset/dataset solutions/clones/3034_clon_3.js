const readAndProcessInput = () => {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(rawInputContent);
};

function processInputData(inputContent) {
    const LINE_DELIMITER = '¥n';
    const WILDCARD_CHAR = '*';

    const inputSegments = inputContent.split(LINE_DELIMITER);

    const [lengthStr, sourceString, ...remainingSegments] = inputSegments;
    const stringLength = parseInt(lengthStr, 10);
    const originalString = sourceString;

    const comparisonCharacter = originalString[stringLength];

    const transformedCharacters = Array.from({ length: stringLength }, (_, charIndex) => {
        const currentCharacter = originalString[charIndex];
        const shouldReplaceWithWildcard = currentCharacter !== comparisonCharacter;
        return shouldReplaceWithWildcard ? WILDCARD_CHAR : currentCharacter;
    });

    console.log(transformedCharacters.join(''));
}

readAndProcessInput();
