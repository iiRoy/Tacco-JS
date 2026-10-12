function processInput(inputData) {
    const rawLine = inputData.split("\n")[0];
    const processedString = rawLine;

    const stringLength = processedString.length;

    let finalOutput = '';

    const getReversedString = (sourceString) => {
        const characters = sourceString.split('');
        const reversedCharacters = characters.reverse();
        const joinedString = reversedCharacters.join('');
        return joinedString;
    };

    switch (stringLength) {
        case 2:
            finalOutput = processedString;
            break;
        case 3:
            finalOutput = getReversedString(processedString);
            break;
        default:
            return;
    }

    console.log(finalOutput);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
