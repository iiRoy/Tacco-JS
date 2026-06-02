function processInput(sourceText) {
    const dataLines = sourceText.split('\n');
    
    const primarySequence = dataLines[1];
    const secondarySequence = dataLines[2];
    const tertiarySequence = dataLines[3];

    const currentLength = primarySequence.length; 

    const totalDiscrepancy = Array.from({ length: currentLength }, (_, positionIndex) => positionIndex)
        .reduce((accumulatedValue, currentPosition) => {
            const charA = primarySequence[currentPosition];
            const charB = secondarySequence[currentPosition];
            const charC = tertiarySequence[currentPosition];

            const distinctCharacters = new Set([charA, charB, charC]);
            
            return accumulatedValue + (distinctCharacters.size - 1);
        }, 0);

    console.log(totalDiscrepancy);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
