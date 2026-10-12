'use strict';

const processInput = (sourceText) => {
    const lineComponents = sourceText.split('\n');
    const primaryLine = lineComponents[0];

    const valueTokens = primaryLine.split(' ');
    const firstValue = valueTokens[0];
    const secondValue = valueTokens[1];

    if (secondValue === undefined) {
        console.log('<');
        return;
    }

    const firstLength = firstValue.length;
    const secondLength = secondValue.length;
    const minimumLength = Math.min(firstLength, secondLength);

    let outcomeIndicator = 0; // 0: equivalent, 1: first > second, -1: first < second

    for (let currentIdx = 0; currentIdx < minimumLength; ++currentIdx) {
        const codeA = firstValue.charCodeAt(currentIdx);
        const codeB = secondValue.charCodeAt(currentIdx);

        if (codeA > codeB) {
            outcomeIndicator = 1;
            break;
        }
        if (codeA < codeB) {
            outcomeIndicator = -1;
            break;
        }
    }

    if (outcomeIndicator === 0) {
        if (firstLength > secondLength) {
            outcomeIndicator = 1;
        } else if (firstLength < secondLength) {
            outcomeIndicator = -1;
        }
    }

    const resultMapping = {
        '1': '>',
        '-1': '<',
        '0': '='
    };

    console.log(resultMapping[outcomeIndicator.toString()]);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
