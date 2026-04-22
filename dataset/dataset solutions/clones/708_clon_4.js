let sourceDataBuffer = '';

const obtainNextDatum = (() => {
    let parsedData = [];
    return () => {
        if (parsedData.length === 0) {
            parsedData = sourceDataBuffer.trim().split(/\s+/).map(Number);
        }
        return parsedData.shift();
    };
})();

const presentOutcome = (message) => {
    console.log(message);
};

const handleOperation = () => {
    let primaryCount, secondaryCount;

    while ((primaryCount = obtainNextDatum()) !== undefined && !isNaN(primaryCount)) {
        secondaryCount = obtainNextDatum();

        const alphaList = [];
        for (let i = 0; i < primaryCount; ++i) {
            alphaList.push(obtainNextDatum());
        }

        const betaList = [];
        for (let i = 0; i < secondaryCount; ++i) {
            betaList.push(obtainNextDatum());
        }

        alphaList.sort((left, right) => left - right);

        const betaValues = new Set(betaList);

        const sumAlpha = alphaList.reduce((accumulator, value) => accumulator + value, 0);
        const sumBeta = betaList.reduce((accumulator, value) => accumulator + value, 0);

        const overallDifference = sumBeta - sumAlpha;
        const targetShift = Math.floor(overallDifference / 2);

        if (overallDifference % 2 !== 0) {
            presentOutcome(-1);
        } else {
            let foundMatch = false;
            for (const currentAlphaElement of alphaList) {
                const soughtValue = currentAlphaElement + targetShift;
                if (betaValues.has(soughtValue)) {
                    presentOutcome(`${currentAlphaElement} ${soughtValue}`);
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                presentOutcome(-1);
            }
        }
    }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    sourceDataBuffer += chunk;
});
process.stdin.on('end', () => {
    handleOperation();
});