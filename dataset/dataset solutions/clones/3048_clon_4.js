function processInputAndCompute(inputStr) {
    const extractNumbers = (text) => {
        const numericParts = text.match(/^\s*(\d+)\s+(\d+)/);
        if (!numericParts || numericParts.length < 3) {
            throw new Error("Input format error: Expected two numbers separated by space.");
        }
        return [parseInt(numericParts[1], 10), parseInt(numericParts[2], 10)];
    };

    const [valX, valY] = extractNumbers(inputStr);

    const iterativeSummation = (firstVal, secondVal, accumulator, remainingSteps) => {
        if (remainingSteps === 0) {
            return accumulator;
        }

        const contribution = firstVal > secondVal ? firstVal : secondVal;
        const nextFirst = firstVal > secondVal ? firstVal - 1 : firstVal;
        const nextSecond = firstVal > secondVal ? secondVal : secondVal - 1;

        return iterativeSummation(nextFirst, nextSecond, accumulator + contribution, remainingSteps - 1);
    };

    return iterativeSummation(valX, valY, 0, 2);
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputAndCompute(inputData));
