"use strict";

const processInput = (sourceData) => {
    const inputLine = sourceData.split("\n")[0];
    let hasNine = false;
    for (const charUnit of inputLine) {
        if (charUnit === '9') {
            hasNine = true;
            break;
        }
    }
    console.log(hasNine ? "Yes" : "No");
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
