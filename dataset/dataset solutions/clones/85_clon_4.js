const fileSystemUtility = require('node:fs');

function calculateSegmentGradient(firstX, firstY, secondX, secondY) {
    const yDifference = secondY - firstY;
    const xDifference = secondX - firstX;
    const gradientValue = yDifference / xDifference;
    return gradientValue.toFixed(6);
}

function processAllInputLines(inputContent) {
    const individualLines = inputContent.split('\n');
    for (const currentLine of individualLines) {
        const lineTokens = currentLine.split(' ');

        // This replicates the original's 'if(c[2])' guard,
        // which checks if the third token (c[2]) exists and is truthy.
        // An empty string '' is falsy, so lines like '1 2 ' (where c[2] is '') are skipped.
        if (!lineTokens[2]) {
            continue;
        }

        const numericalValues = lineTokens.map(Number);

        const xA1 = numericalValues[0];
        const yA1 = numericalValues[1];
        const xA2 = numericalValues[2];
        const yA2 = numericalValues[3];

        const xB1 = numericalValues[4];
        const yB1 = numericalValues[5];
        const xB2 = numericalValues[6];
        const yB2 = numericalValues[7];

        const gradientA = calculateSegmentGradient(xA1, yA1, xA2, yA2);
        const gradientB = calculateSegmentGradient(xB1, yB1, xB2, yB2);

        if (gradientA === gradientB) {
            console.log('YES');
        } else {
            console.log('NO');
        }
    }
}

const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const fullInputText = fileSystemUtility.readFileSync(standardInputPath, textEncoding);
processAllInputLines(fullInputText);