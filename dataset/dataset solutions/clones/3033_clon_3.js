function processInput(inputString) {
    const inputLines = inputString.split('\n');

    const stringLength = Number(inputLines[0]);
    const sourceString = inputLines[1];
    const targetIndex = Number(inputLines[2]);

    const referenceChar = sourceString[targetIndex];

    const transformCharacter = (currentChar) => {
        return currentChar !== referenceChar ? '*' : currentChar;
    };

    const charactersToProcess = sourceString.split('');

    const transformedCharacters = charactersToProcess.map(transformCharacter);

    console.log(transformedCharacters.join(''));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
