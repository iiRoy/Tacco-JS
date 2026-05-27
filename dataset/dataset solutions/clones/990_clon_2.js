const appConfig = {
    sourceFile: '/dev/stdin',
    lineBreakChar: '\n'
};

const inputLineContent = require('fs').readFileSync(appConfig.sourceFile, 'utf-8').split(appConfig.lineBreakChar);

const calculateGCD = (firstNum, secondNum) => {
    if (secondNum === 0) {
        return firstNum;
    }
    return calculateGCD(secondNum, firstNum % secondNum);
};

console.log(calculateGCD(...inputLineContent[0].split(' ').map(strVal => parseInt(strVal))));
