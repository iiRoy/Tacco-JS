let receivedData = '';
process.stdin.on('data', fragment => {
    receivedData += fragment.toString();
});

process.stdin.on('end', () => {
    let currentPhrase = receivedData.trim();
    const phraseExtent = currentPhrase.length;
    const replacementSequence = "AIZUNYAN";
    const windowSize = 8;

    const necessaryCharacterTallies = { 'A': 2, 'D': 1, 'I': 1, 'N': 2, 'U': 1, 'Y': 1 };

    const validateArrangement = (substance) => {
        if (substance.length !== windowSize) return false;
        const substanceCharacterTallies = {};
        for (let characterIterator = 0; characterIterator < substance.length; characterIterator++) {
            const activeCharacter = substance[characterIterator];
            substanceCharacterTallies[activeCharacter] = (substanceCharacterTallies[activeCharacter] || 0) + 1;
        }

        for (const characterKey in necessaryCharacterTallies) {
            if (substanceCharacterTallies[characterKey] !== necessaryCharacterTallies[characterKey]) {
                return false;
            }
        }
        for (const characterKey in substanceCharacterTallies) {
            if (necessaryCharacterTallies[characterKey] === undefined) {
                return false;
            }
        }
        return true;
    };

    let processed = false;
    let currentOffset = 0;

    while (currentOffset <= phraseExtent - windowSize) {
        let currentSpan = currentPhrase.substring(currentOffset, currentOffset + windowSize);
        if (validateArrangement(currentSpan)) {
            currentPhrase = currentPhrase.substring(0, currentOffset) + replacementSequence + currentPhrase.substring(currentOffset + windowSize);
            processed = true;
            break;
        }
        currentOffset++;
    }

    process.stdout.write(currentPhrase);
});