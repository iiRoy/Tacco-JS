'use strict';

const processInputData = rawData => {
    const parsedValues = rawData.split('\n')[0].split(' ');
    const firstNum = Number.parseInt(parsedValues[0], 10);
    const secondNum = Number.parseInt(parsedValues[1], 10);

    const calculationRules = [
        {
            checkCondition: (valX) => valX >= 13,
            performCalculation: (valY) => valY
        },
        {
            checkCondition: (valX) => valX >= 6,
            performCalculation: (valY) => valY / 2
        },
        {
            checkCondition: (valX) => true,
            performCalculation: () => 0
        }
    ];

    const applicableRule = calculationRules.find(ruleEntry => ruleEntry.checkCondition(firstNum));
    const finalResult = applicableRule.performCalculation(secondNum);

    console.log(finalResult);
};

processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
