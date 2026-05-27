function parseLineToNumbers(lineStr) {
    return lineStr.split(" ").map(Number);
}

function determineFinalValue(absNum, absDen) {
    if (absNum % absDen === 0) {
        return (absNum / absDen) * 2;
    } else {
        return Math.ceil(absNum / absDen) * 2 - 1;
    }
}

function processInputData(rawData) {
    const lines = rawData.split("\n");

    const timeParams = parseLineToNumbers(lines[0]);
    const paramsA = parseLineToNumbers(lines[1]);
    const paramsB = parseLineToNumbers(lines[2]);

    const timeVal0 = timeParams[0];
    const timeVal1 = timeParams[1];

    const valA0 = paramsA[0];
    const valA1 = paramsA[1];

    const valB0 = paramsB[0];
    const valB1 = paramsB[1];

    const diffA0B0 = valA0 - valB0;
    const productT1A1 = timeVal1 * valA1;
    const productT1B1 = timeVal1 * valB1;

    const numeratorTerm = timeVal0 * diffA0B0;
    const denominatorTerm = (productT1A1 + numeratorTerm) - productT1B1;

    const signOfNumerator = Math.sign(numeratorTerm);
    const signOfDenominator = Math.sign(denominatorTerm);

    if (signOfNumerator === signOfDenominator) {
        console.log(0);
    } else if (denominatorTerm === 0) {
        console.log("infinity");
    } else {
        const absoluteNumerator = Math.abs(numeratorTerm);
        const absoluteDenominator = Math.abs(denominatorTerm);
        const finalResult = determineFinalValue(absoluteNumerator, absoluteDenominator);
        console.log(finalResult);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
