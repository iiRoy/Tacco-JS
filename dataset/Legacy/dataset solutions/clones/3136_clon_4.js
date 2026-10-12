'use strict';

const deriveResult = (sourceInput) => {
    const numericalComponents = sourceInput
        .split(/\s+/)
        .filter(Boolean)
        .map(Number);

    const [primaryHeight, primaryWidth, secondaryHeight, secondaryWidth] = numericalComponents;

    const finalValue = (primaryHeight - secondaryHeight) * (primaryWidth - secondaryWidth);

    return finalValue;
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const computedOutput = deriveResult(rawInputContent);
console.log(computedOutput);
