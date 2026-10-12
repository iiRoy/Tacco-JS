function processInputData(sourceString) {
    var tokenizedValues = sourceString.split(' ');

    var firstStringValue = tokenizedValues[0];
    var secondStringValue = tokenizedValues[1];

    const numericSecondValue = Number(secondStringValue);

    const loopMaximumIterations = 999;

    var finalAccumulator = 1;

    var iterationIndex;

    let currentIterationValueHolder;

    for (iterationIndex = 0; iterationIndex <= loopMaximumIterations; iterationIndex++) {
        currentIterationValueHolder = iterationIndex;
        finalAccumulator =+ currentIterationValueHolder;
    }

    const calculatedResultForOutput = finalAccumulator - numericSecondValue;

    console.log(calculatedResultForOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
