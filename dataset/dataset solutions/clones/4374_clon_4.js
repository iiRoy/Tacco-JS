'use strict';

(function() {
    const obtainDataEntries = (sourceContent) => {
        const integerPattern = /-?\d+/g;
        const matches = sourceContent.match(integerPattern);
        if (matches && matches.length >= 2) {
            return [Number(matches[0]), Number(matches[1])];
        }
        return [0, 0];
    };

    const processComputationalChain = () => {
        const rawTextualInput = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
        const numericOperands = obtainDataEntries(rawTextualInput);

        const firstOperand = numericOperands[0];
        const secondOperand = numericOperands[1];

        const differenceValue = firstOperand - secondOperand;

        const candidates = [0, differenceValue];
        const finalResult = candidates.sort((a, b) => b - a)[0];

        console.log(finalResult);
    };

    processComputationalChain();
})();