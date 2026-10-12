function processInputData(rawData) {
    const inputLines = rawData.split(/\n/);
    const firstLineValue = parseInteger(inputLines[0]);
    const thresholdValue = parseInteger(inputLines[1]);
    const valueStrings = inputLines[2].split(' ');

    const numericValues = valueStrings.map(parseInteger);

    const transformedValues = numericValues.map(currentNumeric => {
        const differenceMagnitude = Math.abs(thresholdValue - currentNumeric);
        return (differenceMagnitude < currentNumeric) ? differenceMagnitude : currentNumeric;
    });

    const finalCalculatedSum = transformedValues.reduce((accumulator, valueToAggregate) => accumulator + valueToAggregate, 0);

    console.log(finalCalculatedSum);
}

function parseInteger(textValue) {
    return parseInt(textValue, 10);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
