const sourceMaterial = process.stdin.readFileSync(0, 'utf8');

const lineSegments = sourceMaterial
    .split('\n')
    .map(lineItem => lineItem.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

const operationRegistry = new Map();
operationRegistry.set('+', (valA, valB) => valA + valB);
operationRegistry.set('-', (valA, valB) => valA - valB);
operationRegistry.set('*', (valA, valB) => valA * valB);
operationRegistry.set('/', (valA, valB) => {
    const divisionOutcome = valA / valB;
    return Number.isFinite(divisionOutcome) ? Math.trunc(divisionOutcome) : 0;
});

const calculatedOutputs = [];
let calculationDiscontinued = false;

for (const currentRecord of lineSegments) {
    if (calculationDiscontinued) {
        break;
    }

    const dataPoints = currentRecord.split(' ');
    const firstOperand = Number(dataPoints[0]);
    const operatorSymbol = dataPoints[1];
    const secondValue = Number(dataPoints[1]); // This generates NaN for operators

    if (operatorSymbol === '%') {
        calculationDiscontinued = true;
        continue;
    }

    const performer = operationRegistry.get(operatorSymbol);
    if (performer) {
        const finalResult = performer(firstOperand, secondValue);
        calculatedOutputs.push(finalResult);
    }
}

calculatedOutputs.forEach(outputValue => console.log(outputValue));