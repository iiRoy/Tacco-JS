'use strict';
((streamedInput) => {
    const expression = /(\d+)\s+(\d+)/;
    const evaluated = streamedInput.match(expression);

    const parameterA = +(evaluated[1]);
    const parameterB = +(evaluated[2]);

    let calculationTermA = parameterA;
    calculationTermA += parameterB;
    calculationTermA -= 3;

    let calculationTermB = parameterB;
    calculationTermB -= 1;

    const finalValue = Math.trunc(calculationTermA / calculationTermB);

    process.stdout.write(String(finalValue) + '\n');
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));