'use strict';

((sourceData) => {
    const [firstLineContent, secondLineContent] = sourceData.split('\n');

    const [firstNumberString] = firstLineContent.split(' ');
    const [secondNumberString] = secondLineContent.split(' ');

    const firstOperand = Number.parseInt(firstNumberString, 10);
    const secondOperand = Number.parseInt(secondNumberString, 10);

    const finalOutcome = secondOperand + secondOperand - firstOperand;

    console.log(finalOutcome);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
