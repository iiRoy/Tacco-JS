function processData(incomingPayload) {
    const lineSegments = incomingPayload.split('\n');

    const sequenceString = lineSegments[1];
    const operationDescriptions = lineSegments.slice(3);

    const numericSequence = sequenceString.split(' ').map(valueToken => +valueToken);

    const initialTotal = numericSequence.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

    const resultRecords = operationDescriptions.reduce((accumulator, currentDescription) => {
        const operationParameters = currentDescription.split(' ').map(paramToken => +paramToken);
        const indexToModify = operationParameters[0] - 1;
        const replacementValue = operationParameters[1];

        const originalValue = numericSequence[indexToModify];
        const calculatedTotal = initialTotal - originalValue + replacementValue;
        
        accumulator.push(calculatedTotal);
        return accumulator;
    }, []);

    return resultRecords.join('\n');
}

const standardInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();
console.log(processData(standardInput));