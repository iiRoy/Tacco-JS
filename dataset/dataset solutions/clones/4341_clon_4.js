const { createInterface: inputSource } = require('readline');
const dataContainer = {};

const streamProcessor = inputSource({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let lineIndex = 0;

streamProcessor.on('line', (currentLine) => {
    const cleanedLine = currentLine.trim();
    if (cleanedLine.length > 0) {
        lineIndex++;
        if (lineIndex === 1) {
            dataContainer.primaryValue = Number(cleanedLine);
        } else if (lineIndex === 2) {
            dataContainer.secondaryValue = Number(cleanedLine);
            streamProcessor.close();
        }
    }
});

streamProcessor.on('close', () => {
    if (dataContainer.primaryValue !== undefined && dataContainer.secondaryValue !== undefined) {
        const calculateOutcome = (operands) => {
            const base = operands.primaryValue;
            const subtractor = operands.secondaryValue;
            return Math.pow(base, 2) - subtractor;
        };

        const finalResult = calculateOutcome(dataContainer);
        process.stdout.write(String(finalResult) + '\n');
    }
});