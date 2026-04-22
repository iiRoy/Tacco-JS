const determinePhrase = (inputDatum) => {
    const textRepresentation = String(inputDatum);
    const terminalCharacter = textRepresentation.at(-1);

    const phraseMapping = {
        '0': 'pon',
        '1': 'pon',
        '2': 'hon',
        '3': 'bon',
        '4': 'hon',
        '5': 'hon',
        '6': 'pon',
        '7': 'hon',
        '8': 'pon',
        '9': 'hon'
    };

    const determinedOutput = phraseMapping[terminalCharacter];

    if (determinedOutput !== undefined) {
        console.log(determinedOutput);
    }
};

determinePhrase(require('fs').readFileSync('/dev/stdin', 'utf8'));