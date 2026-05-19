const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
const dataRecords = rawInputContent.split('\n');

const processedResults = dataRecords.map(currentRecord => {
    const numericalComponents = currentRecord.split(' ').map(Number);
    const [dividendValue, divisorValue, decimalPlaces] = numericalComponents;

    const calculatedValue = dividendValue / divisorValue;
    const scalingFactor = 10 ** decimalPlaces;
    const scaledAndRounded = Math.round(calculatedValue * scalingFactor);
    
    const relevantDigitsAsNumber = scaledAndRounded % scalingFactor;

    const fractionalString = String(relevantDigitsAsNumber).padStart(decimalPlaces, '0');

    let totalDigitSum = 0;
    for (const digitChar of fractionalString) {
        totalDigitSum += Number(digitChar);
    }
    return totalDigitSum;
});

processedResults.forEach(outputValue => {
    console.log(outputValue);
});
