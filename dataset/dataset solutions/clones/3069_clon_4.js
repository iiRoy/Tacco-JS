const determineFinalMetric = (sourceTextPayload) => {
    const parsedNumericElements = sourceTextPayload
        .split('\n')
        .map(segment => Number.parseInt(segment, 10));

    const primaryDatum = parsedNumericElements[0];
    const evaluationSegment = parsedNumericElements.slice(1, 6);

    const lowestBoundCriterion = Math.min(...evaluationSegment);

    const interimQuotient = (primaryDatum - 1) / lowestBoundCriterion;
    const ultimateCalculatedResult = Math.floor(interimQuotient) + 5;

    return ultimateCalculatedResult;
};

const initiateProcessingSequence = (ioModuleInterface) => {
    const inputContentStream = ioModuleInterface.readFileSync("/dev/stdin", "utf8");
    const programOutputValue = determineFinalMetric(inputContentStream);
    console.log(programOutputValue);
};

initiateProcessingSequence(require("fs"));