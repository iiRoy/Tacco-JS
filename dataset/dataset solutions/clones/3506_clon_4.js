const processInput = (rawData) => {
    const initialText = rawData.split('\n')[0];

    const locateHomogeneousNumber = (digitSequence) => {
        const uniqueCharacters = new Set(digitSequence.split(''));
        if (uniqueCharacters.size === 1) {
            console.log(digitSequence);
            return;
        }

        const nextValue = BigInt(digitSequence) + 1n;
        locateHomogeneousNumber(nextValue.toString());
    };

    locateHomogeneousNumber(initialText);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));