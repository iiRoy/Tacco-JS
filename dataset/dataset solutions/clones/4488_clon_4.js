const processStream = (incomingData) => {
    const sections = incomingData.split('\n');

    const configurationValues = sections[0].split(' ').map(item => parseInt(item, 10));

    const operationSeries = sections[1].split(' ').map(lexeme => BigInt(parseInt(lexeme, 10) % 2));

    const seriesMagnitude = BigInt(operationSeries.length);
    const targetIndex = configurationValues[1];

    const firstOddPosition = operationSeries.findIndex(val => val === 1n);

    let finalCalculatedValue;

    if (firstOddPosition !== -1) {
        finalCalculatedValue = BigInt(2) ** (seriesMagnitude - 1n);
    } else {
        if (targetIndex === 0) {
            finalCalculatedValue = BigInt(2) ** seriesMagnitude;
        } else {
            finalCalculatedValue = BigInt(0);
        }
    }

    return finalCalculatedValue.toString();
};

const fileSystemModule = require("node:fs");
const executeProgram = () => {
    const standardInput = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim();
    const resultString = processStream(standardInput);
    console.log(resultString);
};

executeProgram();