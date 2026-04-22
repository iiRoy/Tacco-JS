const createInputProcessor = (rawData) => {
    let currentPosition = 0;
    const processedTokens = rawData
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/ +/g, ' ')
        .trim()
        .split(' ');

    const retrieveNextToken = () => {
        if (currentPosition < processedTokens.length) {
            return processedTokens[currentPosition++];
        }
        return null;
    };

    return {
        obtainNextString: () => retrieveNextToken(),
        obtainNextInteger: () => {
            const token = retrieveNextToken();
            return token !== null ? parseInt(token, 10) : null;
        },
        obtainNextDecimal: () => {
            const token = retrieveNextToken();
            return token !== null ? parseFloat(token) : null;
        },
        obtainNextBytes: () => {
            const token = retrieveNextToken();
            if (token === null) return null;
            const charCodes = Array.from(token).map(char => char.charCodeAt(0));
            return new Int8Array(charCodes);
        }
    };
};

const mainExecution = (sourceData) => {
    const inputParser = createInputProcessor(sourceData);

    const limitN = inputParser.obtainNextInteger();
    const limitM = inputParser.obtainNextInteger();
    const countQ = inputParser.obtainNextInteger();

    const scoringConditions = Array.from({ length: countQ }, () => ({
        startIdx: inputParser.obtainNextInteger(),
        endIdx: inputParser.obtainNextInteger(),
        diffVal: inputParser.obtainNextInteger(),
        gainScore: inputParser.obtainNextInteger(),
    }));

    let maxAttainedScore = 0;

    const buildAndAssess = (currentArr, lastNum) => {
        if (currentArr.length === limitN) {
            let currentIterationScore = 0;
            for (const condition of scoringConditions) {
                if (currentArr[condition.endIdx - 1] - currentArr[condition.startIdx - 1] === condition.diffVal) {
                    currentIterationScore += condition.gainScore;
                }
            }
            maxAttainedScore = Math.max(maxAttainedScore, currentIterationScore);
            return;
        }

        for (let num = lastNum; num <= limitM; num++) {
            buildAndAssess([...currentArr, num], num);
        }
    };

    buildAndAssess([], 1);

    return maxAttainedScore;
};

console.log(mainExecution(require("fs").readFileSync("/dev/stdin", "utf8")));