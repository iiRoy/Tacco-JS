const performCalculation = (sourceText) => {
    const allLines = sourceText.trim().split('\n');
    const entryCount = Number.parseInt(allLines[0], 10);

    const contestantData = allLines.slice(1, entryCount + 1).map(line => {
        const numericValues = line.split(' ').map(Number);
        const firstContribution = numericValues[0];
        const secondContribution = numericValues[1];
        return [firstContribution, secondContribution, secondContribution - firstContribution];
    });

    contestantData.sort((candidateA, candidateB) => {
        return candidateB[2] - candidateA[2];
    });

    const finalOutcome = contestantData.reduce((accumulatedScore, currentPair, pairIndex) => {
        if (pairIndex % 2 === 0) {
            return accumulatedScore + currentPair[0];
        } else {
            return accumulatedScore - currentPair[1];
        }
    }, 0);

    return finalOutcome;
};

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
console.log(performCalculation(standardInputContent));