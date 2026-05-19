const fileSystem = require('fs');

const processInputData = (rawData) => {
    const commandLines = rawData.trim().split('\n');
    commandLines.shift();

    const commandDispatch = Object.freeze({
        "insert": (currentElements, val) => [val, ...currentElements],
        "delete": (currentElements, val) => [...currentElements],
        "deleteFirst": (currentElements) => currentElements.slice(1),
        "deleteLast": (currentElements) => currentElements.slice(0, -1)
    });

    const finalElements = commandLines.reduce((accumulator, currentInstruction) => {
        const [operationName, operandString] = currentInstruction.split(" ");
        const operandValue = parseInt(operandString, 10);

        const operationFunction = commandDispatch[operationName];
        if (operationFunction) {
            return operationFunction(accumulator, operandValue);
        }
        return accumulator;
    }, []);

    return finalElements.join(" ");
};

const sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');
console.log(processInputData(sourceData));
