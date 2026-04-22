(function () {
    'use strict';

    let acquiredInputFragments = [];
    process.stdin.on('data', (dataPayload) => {
        acquiredInputFragments.push(dataPayload);
    });

    process.stdin.on('end', () => {
        const fullInputString = Buffer.concat(acquiredInputFragments).toString().trim();
        
        const mainNumericString = fullInputString.split(' ')[0];
        const evaluatedNumber = Number(mainNumericString);

        const digitSum = [...String(evaluatedNumber)].reduce((accumulatorValue, digitCharacter) => accumulatorValue + Number(digitCharacter), 0);

        const finalDecision = (evaluatedNumber % digitSum === 0) ? "Yes" : "No";

        process.stdout.write(finalDecision + '\n');
    });
})();