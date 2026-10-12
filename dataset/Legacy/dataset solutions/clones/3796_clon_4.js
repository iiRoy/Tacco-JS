const processInput = (sourceText) => {
    const lines = sourceText.split('\n');
    const targetString = lines[1];
    const stringLength = targetString.length;

    const wPrefixSums = new Array(stringLength + 1).fill(0);
    for (let k = 0; k < stringLength; k++) {
        wPrefixSums[k + 1] = wPrefixSums[k] + (targetString[k] === 'W' ? 1 : 0);
    }

    const eSuffixSums = new Array(stringLength + 1).fill(0);
    for (let k = stringLength - 1; k >= 0; k--) {
        eSuffixSums[k] = eSuffixSums[k + 1] + (targetString[k] === 'E' ? 1 : 0);
    }

    let minimumTransformations = Infinity;

    for (let idx = 0; idx < stringLength; idx++) {
        const leftCost = wPrefixSums[idx];
        const rightCost = eSuffixSums[idx + 1];

        const currentTotalCost = leftCost + rightCost;
        if (currentTotalCost < minimumTransformations) {
            minimumTransformations = currentTotalCost;
        }
    }

    console.log(minimumTransformations);
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
