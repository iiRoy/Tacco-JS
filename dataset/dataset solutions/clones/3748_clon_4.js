const operationExecutor = (dataStream) => {
    const dataSegments = dataStream.match(/(\d+)\s(\d+)/);
    const primaryComponent = parseInt(dataSegments[1], 10);
    const secondaryComponent = parseInt(dataSegments[2], 10);

    const primaryConstraintMet = +(primaryComponent <= 8);
    const secondaryConstraintMet = +(secondaryComponent <= 8);

    const overallConstraintStatus = primaryConstraintMet * secondaryConstraintMet;

    const outcomeLabels = [":(", "Yay!"];
    const resultDisplay = outcomeLabels[overallConstraintStatus];

    console.log(resultDisplay);
};

operationExecutor(require("fs").readFileSync("/dev/stdin", "utf8").trim());