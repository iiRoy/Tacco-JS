const acquireData = (rawTextContent) => {
    const processedNumbers = rawTextContent
        .split('\n')
        .flatMap(currentLine => currentLine.split(' '))
        .filter(tokenUnit => tokenUnit.length > 0)
        .map(numericalString => Number(numericalString));

    let currentPosition = 0;

    return () => {
        if (currentPosition < processedNumbers.length) {
            return processedNumbers[currentPosition++];
        }
        return undefined;
    };
};

const determineFinalValue = () => {
    const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
    const obtainNextItem = acquireData(sourceData);

    const valueOne = obtainNextItem();
    const valueTwo = obtainNextItem();

    return Math.max(0, valueOne - (2 * valueTwo));
};

console.log(determineFinalValue());