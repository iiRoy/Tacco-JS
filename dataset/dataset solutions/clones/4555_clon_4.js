const inputAcquirer = require('readline');
const outputDestination = process.stdout;

const computationPathways = {
    'greaterScenario': (firstVal, secondVal, thirdVal) => BigInt(0),

    'lessOrEqualScenarios': {
        'firstIsOne': (firstVal, secondVal, thirdVal) => (secondVal === thirdVal ? BigInt(1) : BigInt(0)),
        
        'firstIsNotOne': (firstVal, secondVal, thirdVal) => {
            const differenceComponent = thirdVal - secondVal;
            const adjustmentComponent = firstVal - BigInt(2);
            return differenceComponent * adjustmentComponent + BigInt(1);
        }
    }
};

function processNumericalOperation(inputX, inputY, inputZ) {
    const operandX = BigInt(inputX);
    const operandY = BigInt(inputY);
    const operandZ = BigInt(inputZ);

    if (operandY > operandZ) {
        return computationPathways.greaterScenario(operandX, operandY, operandZ);
    } else {
        if (operandX === BigInt(1)) {
            return computationPathways.lessOrEqualScenarios.firstIsOne(operandX, operandY, operandZ);
        } else {
            return computationPathways.lessOrEqualScenarios.firstIsNotOne(operandX, operandY, operandZ);
        }
    }
}

const dataProcessor = inputAcquirer.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let firstInputLineProcessed = false;
let numericalParameters = [];

dataProcessor.on('line', (receivedLine) => {
    if (!firstInputLineProcessed) {
        numericalParameters = receivedLine.split(' ').map(valueStr => BigInt(valueStr));
        firstInputLineProcessed = true;
        dataProcessor.close();
    }
});

dataProcessor.on('close', () => {
    const xParameter = numericalParameters[0];
    const yParameter = numericalParameters[1];
    const zParameter = numericalParameters[2];

    const finalCalculationResult = processNumericalOperation(xParameter, yParameter, zParameter);

    outputDestination.write(finalCalculationResult.toString() + '\n');
});