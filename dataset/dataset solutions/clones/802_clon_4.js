function* lineProvider(textSource) {
    const contentLines = textSource.trim().split("\n");
    for (const lineEntry of contentLines) {
        yield lineEntry;
    }
}

function processEvaluation(lineIterator) {
    const configLineResult = lineIterator.next();
    if (configLineResult.done) {
        return;
    }

    const configTokens = configLineResult.value.split(" ").map(Number);
    const scoreQuantity = configTokens[0];
    const targetSubjectIndex = configTokens[1] - 1;
    const penaltyPercentage = configTokens[2];

    if (scoreQuantity === 0 && configTokens[1] === 0 && penaltyPercentage === 0) {
        return;
    }

    const subjectScores = Array.from({ length: scoreQuantity }, () => {
        const scoreEntry = lineIterator.next();
        return Number(scoreEntry.value);
    });

    const rawTotalPoints = subjectScores.reduce((accumulator, scoreVal) => accumulator + (scoreVal * 100), 0);

    const adjustedTotalPoints = rawTotalPoints * (100 - penaltyPercentage) / 100;

    let computedResult = 0;
    const pivotalScore = subjectScores[targetSubjectIndex];

    if (pivotalScore !== 0) {
        computedResult = Math.trunc(adjustedTotalPoints / pivotalScore);
    }

    console.log(computedResult);

    processEvaluation(lineIterator);
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLineIterator = lineProvider(rawInputContent);
processEvaluation(inputLineIterator);