const readInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let acquiredNumbers = [];
readInterface.on('line', (lineContent) => {
    acquiredNumbers.push(Number(lineContent.trim()));
    if (acquiredNumbers.length === 2) {
        const firstOperand = acquiredNumbers[0];
        const secondOperand = acquiredNumbers[1];

        const comparisonIdentifier = firstOperand < secondOperand ? -1 : (firstOperand > secondOperand ? 1 : 0);

        const resultPhrases = {
            "-1": "a < b",
            "0": "a = b",
            "1": "a > b"
        };
        
        process.stdout.write(resultPhrases[comparisonIdentifier] + '\n');
        readInterface.close();
    }
});