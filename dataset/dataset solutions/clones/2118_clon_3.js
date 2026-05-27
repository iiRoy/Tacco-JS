const ERROR_CODE = -1;
const INITIAL_DIGIT_STATE = -1;

const solve = (rawInput) => {
    const inputLines = rawInput.split('\n');

    const [digitCount, constraintCount] = inputLines.shift().split(' ').map(Number);

    const currentDigits = Array(digitCount).fill(INITIAL_DIGIT_STATE);

    for (let constraintIdx = 0; constraintIdx < constraintCount; constraintIdx++) {
        const [pos, val] = inputLines.shift().split(' ').map(Number);
        const targetIndex = pos - 1;

        if (currentDigits[targetIndex] !== INITIAL_DIGIT_STATE && currentDigits[targetIndex] !== val) {
            console.log(ERROR_CODE);
            return;
        }

        currentDigits[targetIndex] = val;
    }

    const processedDigits = [...currentDigits];

    if (digitCount > 1) {
        const firstDigitValue = processedDigits[0];

        if (firstDigitValue === 0 || firstDigitValue === INITIAL_DIGIT_STATE) {
            console.log(ERROR_CODE);
            return;
        }

        for (let fillIdx = 0; fillIdx < digitCount; fillIdx++) {
            if (processedDigits[fillIdx] === INITIAL_DIGIT_STATE) {
                processedDigits[fillIdx] = 0;
            }
        }
    } else {
        if (processedDigits[0] === INITIAL_DIGIT_STATE) {
            processedDigits[0] = 0;
        }
    }

    console.log(processedDigits.join(''));
};

const fs = require('fs');

solve(fs.readFileSync('/dev/stdin', 'utf8'));
