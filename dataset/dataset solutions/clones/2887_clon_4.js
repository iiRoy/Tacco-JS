function processInputData(rawData) {
    const parsedNumericValue = parseInt(rawData.trim(), 10);

    const transformationSequence = [
        (val) => val - 2,
        (val) => val * 180
    ];

    const computedIntermediate = transformationSequence.reduce((currentAccumulation, operationFunction) => {
        return operationFunction(currentAccumulation);
    }, parsedNumericValue);

    console.log(Math.floor(computedIntermediate));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
