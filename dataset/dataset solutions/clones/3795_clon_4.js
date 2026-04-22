const processInput = (rawText) => {
    const lines = rawText.split('\n');
    const seqLength = parseInt(lines[0], 10);
    const charSequence = lines[1];

    const westCountsBefore = new Array(seqLength + 1).fill(0);
    const eastCountsAfter = new Array(seqLength + 1).fill(0);

    for (let k = 0; k < seqLength; ++k) {
        westCountsBefore[k + 1] = westCountsBefore[k] + (charSequence[k] === 'W' ? 1 : 0);
    }

    for (let k = seqLength - 1; k >= 0; --k) {
        eastCountsAfter[k] = eastCountsAfter[k + 1] + (charSequence[k] === 'E' ? 1 : 0);
    }

    let minimumAdjustments = 300000;

    for (let idx = 0; idx < seqLength; ++idx) {
        const currentAdjustments = westCountsBefore[idx] + eastCountsAfter[idx + 1];
        if (currentAdjustments < minimumAdjustments) {
            minimumAdjustments = currentAdjustments;
            if (minimumAdjustments === 0) {
                break;
            }
        }
    }

    console.log(minimumAdjustments);
    return 0;
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());