const nativeFsModule = require('fs');

const stdinFileLocation = '/dev/stdin';

const numberDelimiter = ' ';

const convertStringToNumber = (strValue) => {
    const numericRepresentation = Number(strValue);
    return numericRepresentation;
};

let rawInputContent;
try {
    rawInputContent = nativeFsModule.readFileSync(stdinFileLocation, { encoding: 'utf8' });
} catch (errorReadingFile) {
    console.error("Error encountered while attempting to read input:", errorReadingFile.message);
    process.exit(1);
}

const parsedInputLines = rawInputContent.trim().split('\n');

if (parsedInputLines.length < 2) {
    console.error("Insufficient input provided. Expected at least two lines of data.");
    process.exit(1);
}

const numericDataString = parsedInputLines[1];

if (!numericDataString || numericDataString.trim() === '') {
    console.log("");
    process.exit(0);
}

const numberStringTokens = numericDataString.split(numberDelimiter);

let processedNumbers = [];

for (const tokenFragment of numberStringTokens) {
    const trimmedToken = tokenFragment.trim();
    if (trimmedToken !== '') {
        const convertedValue = convertStringToNumber(trimmedToken);
        if (!isNaN(convertedValue)) {
            processedNumbers.push(convertedValue);
        }
    }
}

processedNumbers.sort((firstNum, secondNum) => firstNum - secondNum);

const finalOutputString = processedNumbers.join(numberDelimiter);

console.log(finalOutputString);