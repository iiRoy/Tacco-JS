const dataLines = [];
const readLineInterfaceModule = require('readline');

const inputProcessor = readLineInterfaceModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function computeFinalScore(totalProb, solvedProb) {
    const baseScoreComponent = 1900 * solvedProb;
    const unsolvedPenaltyComponent = 100 * (totalProb - solvedProb);
    const totalScoreInsideParentheses = baseScoreComponent + unsolvedPenaltyComponent;

    const powerOfTwoFactor = 2 ** solvedProb;

    return powerOfTwoFactor * totalScoreInsideParentheses;
}

inputProcessor.on('line', (currentLineSegment) => {
    dataLines.push(currentLineSegment);
});

inputProcessor.on('close', () => {
    const firstInputLine = dataLines[0];
    const lineComponents = firstInputLine.split(" ");

    const problemCountN = parseInt(lineComponents[0], 10);
    const solvedCountM = parseInt(lineComponents[1], 10);

    const finalCalculatedValue = computeFinalScore(problemCountN, solvedCountM);

    console.log(finalCalculatedValue);
});
