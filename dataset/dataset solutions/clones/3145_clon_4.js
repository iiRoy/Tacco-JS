"use strict";

const processInputAndCalculate = (rawData) => {
    const dataLines = rawData.split("\n");
    const numericParts = dataLines[0].split(/\s/).map(Number);
    
    const firstOperand = numericParts[0];
    const secondOperand = numericParts[1];

    const computeFinalValue = (valX, valY) => {
        if (valX === valY) {
            return valX;
        }

        const xorResult = valX ^ valY;
        const haveSameParity = (valX % 2) === (valY % 2);

        return xorResult - (haveSameParity ? 1 : 0);
    };

    return computeFinalValue(firstOperand, secondOperand);
};

const scriptEntry = (inputContent) => {
    console.log(processInputAndCalculate(inputContent));
};

scriptEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
