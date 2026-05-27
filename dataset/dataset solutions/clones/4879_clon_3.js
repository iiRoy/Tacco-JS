function processInputAndCountSwitches(inputLines) {
    const firstLineContent = inputLines[0];
    const characterSequence = firstLineContent.split("");
    
    let alternationCounter = 0;
    const sequenceLength = characterSequence.length;

    const checkAdjacentDifference = (charA, charB) => {
        return charA !== charB;
    };

    for (let currentPosition = 1; currentPosition < sequenceLength; currentPosition++) {
        const previousCharacter = characterSequence[currentPosition - 1];
        const currentCharacter = characterSequence[currentPosition];

        if (checkAdjacentDifference(previousCharacter, currentCharacter)) {
            alternationCounter++;
        }
    }
    
    console.log(alternationCounter);
}

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedData = fileData.trim();
const dataLines = processedData.split("\n");

processInputAndCountSwitches(dataLines);
