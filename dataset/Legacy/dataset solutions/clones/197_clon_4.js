const lineBreak = '\n';

const sourceTokens = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s|,/);

const finalTally = sourceTokens.reduce((accumulator, currentToken, currentIndex) => {
    if (currentIndex % 2 !== 0) {
        console.log(currentIndex, currentToken);

        switch (currentToken) {
            case 'A':
                accumulator.alphaCount++;
                break;
            case 'B':
                accumulator.bravoCount++;
                break;
            case 'O':
                accumulator.charlieCount++;
                break;
            default:
                accumulator.deltaCount++;
                break;
        }
    }
    return accumulator;
}, { alphaCount: 0, bravoCount: 0, charlieCount: 0, deltaCount: 0 });

console.log(finalTally.alphaCount + lineBreak + finalTally.bravoCount + lineBreak + finalTally.deltaCount + lineBreak + finalTally.charlieCount);
