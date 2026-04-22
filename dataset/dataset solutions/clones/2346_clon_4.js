const stringCharacteristic = (stringData) => {
    const targetString = stringData[0];
    const stringLength = targetString.length;
    const halfLength = Math.floor(stringLength / 2);
    const oddLengthAdjustment = stringLength % 2;

    const findDivergence = (position, accumulatedDivergence) => {
        if (position >= halfLength) {
            return accumulatedDivergence;
        }

        const firstSegmentCharIndex = halfLength - 1 - position;
        const secondSegmentCharIndex = halfLength + oddLengthAdjustment + position;

        const charA = targetString.charCodeAt(firstSegmentCharIndex);
        const charB = targetString.charCodeAt(secondSegmentCharIndex);

        const newAccumulatedDivergence = accumulatedDivergence + (charA !== charB ? 1 : 0);

        return findDivergence(position + 1, newAccumulatedDivergence);
    };

    return findDivergence(0, 0);
};

const processExternalSource = (fileSystemModule) => {
    const acquiredText = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const outcome = stringCharacteristic([acquiredText]);
    console.log(outcome);
};

processExternalSource(require('fs'));