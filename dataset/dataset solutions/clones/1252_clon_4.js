const fileSystem = require('fs');

const performOperation = (inputString) => {
    const components = inputString.split(" ", 3);
    const operandOne = Number.parseInt(components[0]);
    const operatorSymbol = components[1];
    const operandTwo = Number.parseInt(components[2]);

    const operatorFunctions = {
        '+': (valA, valB) => valA + valB,
        '-': (valA, valB) => valA - valB,
        '*': (valA, valB) => valA * valB,
    };

    if (operatorSymbol in operatorFunctions) {
        return operatorFunctions[operatorSymbol](operandOne, operandTwo);
    } else {
        // This implicitly handles division and any other unrecognized operator,
        // falling back to floor division as per the original's final 'return' statement.
        return Math.floor(operandOne / operandTwo);
    }
};

const executeComputation = async () => {
    const rawContent = await fileSystem.promises.readFile('/dev/stdin', { encoding: 'ascii' });
    const rawInputRows = rawContent.split("\n");

    let finalDelimiterPos = -1;
    finalDelimiterPos = rawInputRows.reduce((lastFoundIdx, currentElement, elementIdx) => {
        return currentElement.includes("?") ? elementIdx : lastFoundIdx;
    }, -1);
    
    const extractedRows = rawInputRows.slice(0, finalDelimiterPos);

    const computedResults = extractedRows.map(performOperation);

    console.log(computedResults.join("\n"));
};

executeComputation();