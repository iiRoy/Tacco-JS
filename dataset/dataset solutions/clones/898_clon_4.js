const processInputData = (fullRawText) => {
    const transformNumericResult = (numericValue) => {
        if (Number.isInteger(numericValue)) {
            return String(numericValue);
        }

        let currentMultiplier = 1;
        while (!Number.isInteger(numericValue * currentMultiplier)) {
            currentMultiplier *= 2;
        }
        return `${numericValue * currentMultiplier}/${currentMultiplier}`;
    };

    const analyzeDirectionSequence = (rawSequence) => {
        const cleanedSequence = rawSequence.replace(/orth|est/g, "");

        if (cleanedSequence.length === 0) {
            return 0;
        }

        const initialChar = cleanedSequence[0];
        let initialState = {
            currentBearing: initialChar === 'n' ? 0 : 90,
            previousDirection: initialChar,
            consecutiveCount: 1,
        };

        const finalState = Array.from(cleanedSequence.slice(1)).reduce((state, char) => {
            let newBearing = state.currentBearing;
            const prevDir = state.previousDirection;
            const prevCount = state.consecutiveCount;

            if (char === 'n' && prevDir !== 'n') {
                newBearing -= 90 / Math.pow(2, prevCount);
            } else if (char === 'w' && prevDir !== 'w') {
                newBearing += 90 / Math.pow(2, prevCount);
            }

            const newCount = (prevDir === char) ? prevCount + 1 : 1;
            const newDirection = char;

            return {
                currentBearing: newBearing,
                previousDirection: newDirection,
                consecutiveCount: newCount,
            };
        }, initialState);

        return finalState.currentBearing;
    };

    const outputResults = fullRawText
        .trim()
        .split("\n")
        .filter(line => line !== "#")
        .map(line => analyzeDirectionSequence(line))
        .map(numericResult => transformNumericResult(numericResult));

    return outputResults.join("\n");
};

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputData(sourceData));