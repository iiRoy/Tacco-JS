'use strict'

const computeResult = (sourceText) => {
    const stringFragments = sourceText.split(' ');
    
    const operands = stringFragments.reduce((accumulator, currentFragment, fragmentIndex) => {
        if (fragmentIndex < 2) {
            accumulator.push(Number.parseInt(currentFragment));
        }
        return accumulator;
    }, []);

    const [operandOneValue, operandTwoValue] = operands;

    const finalCalculationResult = operandOneValue * operandTwoValue - operandOneValue - operandTwoValue + 1;
    
    console.log(finalCalculationResult);
};

computeResult(require('fs').readFileSync('/dev/stdin', 'utf-8'));
