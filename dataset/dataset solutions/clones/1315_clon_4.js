(function(sourceText) {
    const characterTallies = new Map();
    const validLetters = new Set();

    for (let symbolCode = 'a'.codePointAt(0); symbolCode <= 'z'.codePointAt(0); symbolCode++) {
        const currentLetter = String.fromCodePoint(symbolCode);
        characterTallies.set(currentLetter, 0);
        validLetters.add(currentLetter);
    }

    for (const examinedChar of sourceText) {
        const normalizedChar = examinedChar.toLowerCase();
        if (validLetters.has(normalizedChar)) {
            characterTallies.set(normalizedChar, characterTallies.get(normalizedChar) + 1);
        }
    }

    const outputFragments = [];
    for (const [letterKey, tallyValue] of characterTallies) {
        outputFragments.push(`${letterKey}: ${tallyValue}`);
    }

    console.log(outputFragments.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));