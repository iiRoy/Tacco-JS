const fileSystemInterface = require('fs');

const procureTokens = (textualData) => {
    return textualData.match(/\S+/g) || [];
};

const performComputation = (inputElement) => {
    const numericalUnit = +inputElement;
    const squareComponent = numericalUnit * numericalUnit;
    const linearComponent = numericalUnit;
    const constantComponent = 2;
    const sumOfComponents = squareComponent + linearComponent + constantComponent;
    return sumOfComponents / 2;
};

const sourceContent = fileSystemInterface.readFileSync(0, 'utf8');
const valueUnits = procureTokens(sourceContent);
const transformedOutputs = valueUnits.map(performComputation);

process.stdout.write(transformedOutputs.join('\n') + '\n');