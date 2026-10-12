'use strict'

const processInput = rawData => {
    const [_, firstNumStr, secondNumStr] = rawData.match(/(\d+)\s+(\d+)/);

    const firstNum = Number(firstNumStr);
    const secondNum = Number(secondNumStr);

    const conditionEvaluators = [
        { check: (val1, val2) => val1 + val2 === 15, symbol: '+' },
        { check: (val1, val2) => val1 * val2 === 15, symbol: '*' }
    ];

    const matchedOutcome = conditionEvaluators.find(evaluator =>
        evaluator.check(firstNum, secondNum)
    );

    console.log(matchedOutcome ? matchedOutcome.symbol : 'x');
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
