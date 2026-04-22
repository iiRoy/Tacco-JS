function transformData(rawContent) {
    const digitsFound = rawContent.match(/\d+/g);
    const numericSequence = digitsFound.map(str => +str);

    const primaryFigure = numericSequence[0];
    const auxiliaryFigures = numericSequence.slice(1, 6);

    const smallestAuxiliary = auxiliaryFigures.reduce((currentMin, currentVal) => {
        return currentVal < currentMin ? currentVal : currentMin;
    }, Infinity);

    const computedQuotient = Math.floor((primaryFigure + smallestAuxiliary - 1) / smallestAuxiliary);

    const ultimateResult = 4 + computedQuotient;

    return ultimateResult;
}

(function () {
    const inputPayload = require("fs").readFileSync("/dev/stdin", "utf8");
    const outcome = transformData(inputPayload);
    console.log(outcome);
})();