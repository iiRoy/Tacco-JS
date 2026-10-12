function main(inputData) {
    const inputLines = inputData.split('\n');
    const charLimit = Number(inputLines[0]);
    const sourceText = inputLines[1];
    const keyIndex = Number(inputLines[2]);

    const referenceCharacter = sourceText[keyIndex];

    const processedCharacters = Array.from({ length: charLimit }, (_, index) => {
        const currentCharacter = sourceText[index];
        return currentCharacter === referenceCharacter ? currentCharacter : '*';
    });

    console.log(processedCharacters.join(''));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
