const datasource = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const instructionSet = datasource.split('\n');

const processOperationsSequentially = (remainingInstructions, currentIndex = 0) => {
    // Base case: All instructions processed or termination encountered
    if (currentIndex >= remainingInstructions.length) {
        return;
    }

    const currentInstructionText = remainingInstructions[currentIndex];

    // Handle empty lines, replicating Math.floor(eval('')) -> NaN
    if (currentInstructionText.trim() === '') {
        process.stdout.write(NaN + '\n');
        processOperationsSequentially(remainingInstructions, currentIndex + 1); // Recurse to next instruction
        return;
    }

    const instructionTokens = currentInstructionText.trim().split(/\s+/);

    // Check for termination condition: second token is '?'
    if (instructionTokens.length >= 2 && instructionTokens[1] === '?') {
        return; // Stop processing, mimicking the 'break'
    }

    // Custom arithmetic computation logic (replaces 'eval' and 'Math.floor')
    const computeNumericResult = (expressionString) => {
        const expressionParts = expressionString.trim().split(/\s+/);

        // Handle single number expressions like "5", replicating Math.floor(eval("5")) -> 5
        if (expressionParts.length === 1 && !isNaN(parseFloat(expressionParts[0]))) {
            return Math.floor(parseFloat(expressionParts[0]));
        }
        // This parser assumes simple "operand operator operand" format.
        // It does not handle complex expressions like "1 + 2 * 3" or "(1 + 2) * 3"
        // as the original 'eval' would, based on the 'split(" ")[1]' condition in the original code.
        if (expressionParts.length !== 3) {
            throw new Error(`Invalid expression format for custom evaluator: ${expressionString}`);
        }

        const firstOperand = parseFloat(expressionParts[0]);
        const operatorSymbol = expressionParts[1];
        const secondOperand = parseFloat(expressionParts[2]);

        let calculationOutcome;
        switch (operatorSymbol) {
            case '+': calculationOutcome = firstOperand + secondOperand; break;
            case '-': calculationOutcome = firstOperand - secondOperand; break;
            case '*': calculationOutcome = firstOperand * secondOperand; break;
            case '/': calculationOutcome = firstOperand / secondOperand; break;
            default: throw new Error(`Unrecognized arithmetic operator: ${operatorSymbol}`);
        }
        return Math.floor(calculationOutcome);
    };

    const evaluatedValue = computeNumericResult(currentInstructionText);
    process.stdout.write(evaluatedValue + '\n'); // Output result immediately

    processOperationsSequentially(remainingInstructions, currentIndex + 1); // Recurse for the next instruction
};

// Initiate the recursive processing of the instruction set
processOperationsSequentially(instructionSet);