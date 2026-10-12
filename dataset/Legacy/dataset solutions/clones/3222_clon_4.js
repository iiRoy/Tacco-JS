const processNumbers = (unusedIdentifier, dataElements) => {
    const totalValue = dataElements.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
    const greatestValue = Math.max(...dataElements);
    const conditionMet = (2 * greatestValue) < totalValue;
    return conditionMet ? 'Yes' : 'No';
};

const entryPoint = (rawInput) => {
    const lines = rawInput.split('\n');
    const firstLineContent = lines[0];
    const numericSequence = lines[1].split(' ').map(val => parseInt(val, 10));

    console.log(processNumbers(firstLineContent, numericSequence));
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
