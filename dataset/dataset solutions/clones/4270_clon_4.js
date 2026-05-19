process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedDataBuffer = '';
process.stdin.on('data', (segment) => {
    collectedDataBuffer += segment;
});

process.stdin.on('end', () => {
    calculateAndDisplayResult(collectedDataBuffer.split(/\r?\n/));
});

function calculateAndDisplayResult(lineSegments) {
    const firstOperand = Number(lineSegments[0]);
    const secondOperand = Number(lineSegments[1]);

    const operationElements = [secondOperand, secondOperand, -firstOperand];
    const finalOutcome = operationElements.reduce((currentSum, element) => currentSum + element, 0);

    console.log(finalOutcome);

    return 0;
}
