let acquiredContent = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (piece) => {
    acquiredContent += piece;
});

process.stdin.on('end', () => {
    const transformSequence = (initialContent) => {
        const punctuationPattern = /^\s+|\s+$/g;
        const cleansedContent = initialContent.replace(punctuationPattern, '');

        if (cleansedContent.length < 8) {
            return cleansedContent;
        }

        const characterCollection = [...cleansedContent];
        const nominalCharacterCounts = { 'A': 2, 'D': 1, 'I': 1, 'N': 2, 'U': 1, 'Y': 1 };
        const desiredReplacement = [...'AIDUNYAN'];

        const verifyCharacterArrangement = (segmentOfUnits) => {
            if (segmentOfUnits.length !== 8) {
                return false;
            }
            const currentCounts = {};
            for (const unit of segmentOfUnits) {
                currentCounts[unit] = (currentCounts[unit] || 0) + 1;
            }

            for (const key in nominalCharacterCounts) {
                if (currentCounts[key] !== nominalCharacterCounts[key]) {
                    return false;
                }
            }
            for (const key in currentCounts) {
                if (nominalCharacterCounts[key] === undefined) {
                    return false;
                }
            }
            return true;
        };

        let discoveryIndex = -1;
        const potentialStartPositions = Array.from({ length: characterCollection.length - 7 }, (_, k) => k);

        discoveryIndex = potentialStartPositions.findIndex(currentPosition =>
            verifyCharacterArrangement(characterCollection.slice(currentPosition, currentPosition + 8))
        );

        if (discoveryIndex !== -1) {
            const mutableCollection = [...characterCollection];
            mutableCollection.splice(discoveryIndex, 8, ...desiredReplacement);
            return mutableCollection.join('');
        } else {
            return cleansedContent;
        }
    };

    const finalResult = transformSequence(acquiredContent);
    process.stdout.write(finalResult);
});

process.stdin.resume();