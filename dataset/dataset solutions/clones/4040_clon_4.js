const acquireProcessedNumbers = (isDevelopmentMode) => {
    const sourceContent = isDevelopmentMode
        ? '431 321'
        : (() => {
            const fileSystemModule = require('fs');
            return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        })();
    return sourceContent.split('\n').map(strVal => parseInt(strVal, 10));
};

const isDevelopment = false;
const processedValues = acquireProcessedNumbers(isDevelopment);

const dividendValue = processedValues[0];
const divisorValue = processedValues[1];

const resultToDisplay = Number.isInteger(dividendValue / divisorValue) ? -1 : dividendValue;

console.log(resultToDisplay);
