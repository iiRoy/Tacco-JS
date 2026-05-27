'use strict';

function HandleNumericInput(sourceText) {
    const inputNumber = Number(sourceText.trim().split('\n')[0]);
    console.log(inputNumber);

    const digitProhibitionMap = new Array(10).fill(false);
    digitProhibitionMap[0] = true;
    digitProhibitionMap[2] = true;
    digitProhibitionMap[4] = true;
    digitProhibitionMap[5] = true;
    digitProhibitionMap[6] = true;
    digitProhibitionMap[8] = true;

    const finalDigit = inputNumber % 10;

    if (digitProhibitionMap[finalDigit]) {
        console.log('-1');
        return;
    }

    return;
}
HandleNumericInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
