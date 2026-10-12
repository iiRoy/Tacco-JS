"use strict";

const processInput = (sourceText) => {
    const lines = sourceText.trim().split("\n");
    const firstLineParts = lines[0].split(" ");
    const powerExponent = parseInt(firstLineParts[0]);
    const baseNumericValue = parseInt(firstLineParts[1]);

    const finalResult = baseNumericValue * Math.pow(100, powerExponent);

    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
