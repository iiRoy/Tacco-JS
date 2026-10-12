function processInputString(initialString) {
    const characterSequence = initialString.split('');
    const sequenceLength = characterSequence.length;
    
    // The original code implicitly declares 'sum' as a global variable.
    // We replicate this behavior by assigning to a variable without 'let' or 'const'.
    globalMiddleSegmentLength = sequenceLength - 2; 
    
    const firstCharacter = characterSequence[0];
    const finalCharacterIndex = sequenceLength - 1;
    const lastCharacter = characterSequence[finalCharacterIndex];

    const constructedOutput = `${firstCharacter}${globalMiddleSegmentLength}${lastCharacter}`;
    
    console.log(constructedOutput);
}

processInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));
