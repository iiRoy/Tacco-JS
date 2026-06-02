const fileSystem = require('fs');
const standardInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataLines = standardInput.split('\n');

const processLineAndCalculate = (currentLineContent) => {
    const parsedNumbers = currentLineContent.split(' ').map(val => parseInt(val, 10));

    const combinedValues = [
        parsedNumbers[0] + parsedNumbers[3],
        parsedNumbers[1] + parsedNumbers[4],
        parsedNumbers[2] + parsedNumbers[5]
    ];

    if (combinedValues.every(val => val === 0)) {
        process.exit();
    }

    let finalScore = 0;

    const remainders = combinedValues.map(value => {
        finalScore += Math.floor(value / 3);
        return value % 3;
    });

    finalScore += Math.min(...remainders);

    return finalScore;
};

for (let lineIndex = 0; lineIndex < dataLines.length; lineIndex++) {
    const currentLine = dataLines[lineIndex];
    const calculatedResult = processLineAndCalculate(currentLine);
    console.log(calculatedResult);
}
