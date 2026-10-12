const inputLines = [];
const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

inputReader.on('close', () => {
    const processInputAndCompute = (dataLines) => {
        const firstLineContent = dataLines[0];
        const numericValues = firstLineContent.split(' ').map(Number);

        const problemCount = numericValues[0];
        const solvedCount = numericValues[1];

        const calculateBaseScore = (solved) => 1900 * solved;
        const calculatePenalty = (total, solved) => 100 * (total - solved);
        const calculateMultiplier = (solved) => 2 ** solved;

        const baseComponent = calculateBaseScore(solvedCount);
        const penaltyComponent = calculatePenalty(problemCount, solvedCount);
        const sumComponent = baseComponent + penaltyComponent;

        return calculateMultiplier(solvedCount) * sumComponent;
    };

    console.log(processInputAndCompute(inputLines));
});
