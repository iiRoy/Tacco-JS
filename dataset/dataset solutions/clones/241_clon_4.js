const rli = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const outputCollector = [];

const processInputLine = (currentLine) => {
    const numberStrings = currentLine.split(' ');
    const firstValue = Number(numberStrings[0]);
    const secondValue = Number(numberStrings[1]);
    const thirdValue = Number(numberStrings[2]);

    const determineFourthElement = (valA, valB, valC) => {
        const areAllEqual = (valA === valB) && (valB === valC);
        const isSmallEqual = areAllEqual && (valA <= 4);
        return isSmallEqual ? 5 : 4;
    };

    const fourthElementResult = determineFourthElement(firstValue, secondValue, thirdValue);

    const finalComparisonSum = firstValue + secondValue + fourthElementResult;

    outputCollector.push(finalComparisonSum <= 20 ? "YES" : "NO");
};

rli.on('line', processInputLine);

rli.on('close', () => {
    outputCollector.forEach(resultEntry => console.log(resultEntry));
});
