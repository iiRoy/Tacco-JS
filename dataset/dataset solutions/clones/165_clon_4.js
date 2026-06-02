var fileSystem = require('fs');
var fileDescriptorStats = fileSystem.fstatSync(process.stdin.fd);
var bufferLength = fileDescriptorStats.size;
var dataBuffer = Buffer.alloc(bufferLength);
var bytesReadFromInput = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, bufferLength, 0);
var inputDataLines = dataBuffer.toString('utf8', 0, bytesReadFromInput).trim().split('\n');

solveExpressions();

function solveExpressions() {
    const arithmeticOperators = ['+', '-', '*'];

    const calculateAndFormat = (leftOperand, operatorSymbol, rightOperand) => {
        let computedValue;
        switch (operatorSymbol) {
            case '+': computedValue = leftOperand + rightOperand; break;
            case '-': computedValue = leftOperand - rightOperand; break;
            case '*': computedValue = leftOperand * rightOperand; break;
            default: throw new Error('Invalid operator: ' + operatorSymbol);
        }
        return { resultValue: computedValue, expressionString: `(${leftOperand} ${operatorSymbol} ${rightOperand})` };
    };

    function* generateAllPermutations(elementsArray) {
        if (elementsArray.length === 0) {
            yield [];
            return;
        }
        for (let i = 0; i < elementsArray.length; i++) {
            const currentElement = elementsArray[i];
            const remainingElements = [...elementsArray.slice(0, i), ...elementsArray.slice(i + 1)];
            for (const subPermutation of generateAllPermutations(remainingElements)) {
                yield [currentElement, ...subPermutation];
            }
        }
    }

    let currentInputEntry;
    while ((currentInputEntry = inputDataLines.shift()) !== undefined && currentInputEntry !== '0 0 0 0') {
        const initialDigits = currentInputEntry.split(' ').map(Number);
        let lineSolutionFound = false;

        for (const [digitA, digitB, digitC, digitD] of generateAllPermutations(initialDigits)) {
            for (let opIndex1 = 0; opIndex1 < 3; opIndex1++) {
                const operatorSymbol1 = arithmeticOperators[opIndex1];
                for (let opIndex2 = 0; opIndex2 < 3; opIndex2++) {
                    const operatorSymbol2 = arithmeticOperators[opIndex2];
                    for (let opIndex3 = 0; opIndex3 < 3; opIndex3++) {
                        const operatorSymbol3 = arithmeticOperators[opIndex3];

                        if (opIndex1 === 1 && opIndex2 === 1 && opIndex3 === 1) {
                            continue;
                        }

                        let calculationOutcome;

                        calculationOutcome = calculateAndFormat(digitA, operatorSymbol1, digitB);
                        calculationOutcome = calculateAndFormat(calculationOutcome.resultValue, operatorSymbol2, digitC);
                        calculationOutcome = calculateAndFormat(calculationOutcome.resultValue, operatorSymbol3, digitD);
                        if (calculationOutcome.resultValue === 10) {
                            console.log(calculationOutcome.expressionString);
                            lineSolutionFound = true;
                            break;
                        }

                        calculationOutcome = calculateAndFormat(digitB, operatorSymbol1, digitC);
                        calculationOutcome = calculateAndFormat(digitA, operatorSymbol2, calculationOutcome.resultValue);
                        calculationOutcome = calculateAndFormat(calculationOutcome.resultValue, operatorSymbol3, digitD);
                        if (calculationOutcome.resultValue === 10) {
                            console.log(calculationOutcome.expressionString);
                            lineSolutionFound = true;
                            break;
                        }

                        const leftSubExpression = calculateAndFormat(digitA, operatorSymbol1, digitB);
                        const rightSubExpression = calculateAndFormat(digitC, operatorSymbol2, digitD);
                        calculationOutcome = calculateAndFormat(leftSubExpression.resultValue, operatorSymbol3, rightSubExpression.resultValue);
                        if (calculationOutcome.resultValue === 10) {
                            console.log(calculationOutcome.expressionString);
                            lineSolutionFound = true;
                            break;
                        }
                    }
                    if (lineSolutionFound) break;
                }
                if (lineSolutionFound) break;
            }
            if (lineSolutionFound) break;
        }

        if (!lineSolutionFound) {
            console.log(0);
        }
    }
}
