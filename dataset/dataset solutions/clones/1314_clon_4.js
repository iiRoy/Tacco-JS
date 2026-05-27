(function(sourceText) {
    const alphabetLetters = Array.from({ length: 26 }, (_, indexPosition) =>
        String.fromCharCode('a'.charCodeAt(0) + indexPosition)
    );

    const letterTally = alphabetLetters.reduce((accumulatorMap, currentLetter) => {
        accumulatorMap.set(currentLetter, 0);
        return accumulatorMap;
    }, new Map());

    sourceText.split('').reduce((currentTally, characterFromSource) => {
        const normalizedChar = characterFromSource.toLowerCase();
        if (currentTally.has(normalizedChar)) {
            currentTally.set(normalizedChar, currentTally.get(normalizedChar) + 1);
        }
        return currentTally;
    }, letterTally);

    const resultStrings = Array.from(letterTally.entries()).map(([keyChar, countValue]) => {
        return `${keyChar} : ${countValue}`;
    });

    console.log(resultStrings.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
