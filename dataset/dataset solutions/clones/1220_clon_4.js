'use strict';

const dataAcquirer = (sourcePath) => {
    const streamContent = require('fs').readFileSync(sourcePath);
    const textContent = streamContent.toString('utf8');

    let currentSegment = '';
    let numberList = [];
    let lineBreakEncountered = false;

    for (let i = 0; i < textContent.length; i++) {
        const char = textContent[i];

        if (char === '\n') {
            lineBreakEncountered = true;
            if (currentSegment !== '') {
                numberList.push(parseInt(currentSegment, 10));
            }
            break;
        }

        if (char === ' ' || char === '\t') {
            if (currentSegment !== '') {
                numberList.push(parseInt(currentSegment, 10));
                currentSegment = '';
            }
        } else if (char === '-' || (char >= '0' && char <= '9')) {
            currentSegment += char;
        }
    }

    if (!lineBreakEncountered && currentSegment !== '') {
        numberList.push(parseInt(currentSegment, 10));
    }
    return numberList.slice(0, 3);
};

(() => {
    const numericalComponents = dataAcquirer('/dev/stdin');

    const elementOne = numericalComponents[0];
    const elementTwo = numericalComponents[1];
    const elementThree = numericalComponents[2];

    const intermediatePredicate = +!(elementOne >= elementTwo);

    const finalPredicate = (intermediatePredicate < elementThree);

    const responseMatrix = ['No', 'Yes'];

    process.stdout.write(responseMatrix[+finalPredicate] + '\n');
})();