const evaluateModuloCondition = (rawTextData) => {
    const [firstNum, secondNum, thirdNum] = String(rawTextData).trim().split(' ').map(Number);

    const possibleRemainders = Array.from({ length: secondNum }, (_, currentMultiplier) => {
        return (firstNum * currentMultiplier) % secondNum;
    });

    const outcome = possibleRemainders.includes(thirdNum) ? "YES" : "NO";

    console.log(outcome);
};

const inputDataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
evaluateModuloCondition(inputDataStream);