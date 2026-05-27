const systemConfig = {
    sourceFile: '/dev/stdin',
    lineDelimiter: '\n'
};

const entireInputContent = require('fs').readFileSync(systemConfig.sourceFile, 'utf8');

const processedLines = entireInputContent.split(systemConfig.lineDelimiter).filter(Boolean);

const firstNumericValue = Number(processedLines[0]);
const secondNumericValue = Number(processedLines[1]);

function calculateDivisorRecursively(currentDividend, currentDivisor) {
    if (currentDivisor === 0) {
        return currentDividend;
    }
    return calculateDivisorRecursively(currentDivisor, currentDividend % currentDivisor);
}

const finalCommonDivisor = calculateDivisorRecursively(firstNumericValue, secondNumericValue);

console.log(finalCommonDivisor);
