function solveProblem(inputStr) {
    const componentValues = inputStr.split(" ");
    const firstOperand = parseInt(componentValues[0], 10);
    const secondOperand = parseInt(componentValues[1], 10);

    const conditionDiscriminator = Math.pow(Math.E, -Math.abs(firstOperand - 1)) > 0.5 ? 1 : 0;

    const finalOutcome = secondOperand * conditionDiscriminator + (1 - conditionDiscriminator);

    console.log(finalOutcome);
}

solveProblem(require('node:fs').readFileSync('/dev/stdin', 'utf8'));