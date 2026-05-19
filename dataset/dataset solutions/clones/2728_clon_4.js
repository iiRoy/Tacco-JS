function processInputData(sourceText) {
    const numericValue = parseInt(sourceText, 10);

    const factors = [numericValue, numericValue, 3];
    const computedResult = factors.reduce((accumulator, currentFactor) => accumulator * currentFactor);

    console.log(computedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
