'use strict';
(function (inputSource) {
    const processInputAndEvaluate = (dataContent) => {
        const contentLines = dataContent.toString().trim().split('\n');
        const firstValueLine = contentLines[0];

        const numberParts = firstValueLine.match(/-?\d+/g);
        const operandA = +numberParts[0];
        const operandB = +numberParts[1];

        const comparisonMap = new Map([
            [1, 'a > b'],
            [-1, 'a < b'],
            [0, 'a == b']
        ]);

        const resultKey = Math.sign(operandA - operandB);
        return comparisonMap.get(resultKey);
    };

    console.log(processInputAndEvaluate(inputSource));

}(require('fs').readFileSync('/dev/stdin', 'utf8')));