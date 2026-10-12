"use strict"

const obtainInteger = (strValue) => {
    return parseInt(strValue, 10);
};

const processInputData = (rawInputString) => {
    const inputParts = rawInputString.split(' ');

    const firstComponentStr = inputParts[0];
    const valA = obtainInteger(firstComponentStr);

    const secondComponentStr = inputParts[1];
    const valB = obtainInteger(secondComponentStr);

    const thirdComponentStr = inputParts[2];
    const valC = obtainInteger(thirdComponentStr);

    const combinedValue = valB + valC;

    let resultToPrint = 0;

    if (combinedValue > valA) {
        const excessAmount = combinedValue - valA;
        resultToPrint = excessAmount;
    }

    console.log(resultToPrint);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
