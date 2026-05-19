function acquireInput(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}

function emitResult(content){console.log(content);}

function transformInput(dataString, conversionType) {
    const conversionHandlers = {
        0: (s) => s,
        1: (s) => Number.parseInt(s, 10),
        2: (s) => s.split(" "),
        3: (s) => s.split("\n"),
        4: (s) => s.split(" ").map(Number),
        5: (s) => s.split("\n").map(Number),
        6: (s) => s.split(""),
        7: (s) => s.split("").map(Number)
    };
    return conversionHandlers[conversionType](dataString);
}

function processValue(initialInput) {
    const numericRepresentation = transformInput(initialInput, 1);
    const preciseBaseCalculation = numericRepresentation / 1.08;

    const floorVerificationResult = Math.floor(preciseBaseCalculation * 1.08);
    const ceilVerificationResult = Math.ceil(preciseBaseCalculation * 1.08);

    const evaluationPath = [
        { conditionMet: floorVerificationResult === numericRepresentation, outputValue: Math.ceil(preciseBaseCalculation) },
        { conditionMet: ceilVerificationResult === numericRepresentation, outputValue: Math.floor(preciseBaseCalculation) },
        { conditionMet: true, outputValue: ":(" }
    ];

    const finalDecision = evaluationPath.find(path => path.conditionMet).outputValue;
    emitResult(finalDecision);
}

processValue(acquireInput());
