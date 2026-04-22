const inputSystem = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const processInputLine = (incomingText) => {
    const separatorIndex = incomingText.indexOf(' ');
    const operandA = incomingText.substring(0, separatorIndex);
    const operandB = incomingText.substring(separatorIndex + 1);

    const applyReduction = (valString) => {
        const numericalRepresentation = Number.parseInt(valString, 10);
        return numericalRepresentation - 1;
    };

    const outcomeMapping = {
        'first_is_smaller_or_equal': operandA,
        'first_is_greater': applyReduction(operandA)
    };

    const comparisonResult = operandA.localeCompare(operandB);
    const conditionKey = comparisonResult <= 0 ? 'first_is_smaller_or_equal' : 'first_is_greater';

    return outcomeMapping[conditionKey];
};

inputSystem.on('line', (receivedLine) => {
    const computedValue = processInputLine(receivedLine);
    process.stdout.write(String(computedValue) + '\n');
    inputSystem.close();
});