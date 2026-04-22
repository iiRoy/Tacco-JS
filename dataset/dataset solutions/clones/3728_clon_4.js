const computeResultantValue = (incomingDataString) => {
    const dataExtractor = /(\d+)\s+(\d+)/;
    const extractedParts = incomingDataString.match(dataExtractor);

    if (!extractedParts || extractedParts.length < 3) {
        throw new Error("Data parsing failure: Expected two numerical components.");
    }

    const primaryMeasurement = Number(extractedParts[1]);
    const secondaryMeasurement = Number(extractedParts[2]);

    const numericalAdjustments = {
        firstSubtractor: 1,
        secondSubtractor: 2,
        thirdSubtractor: 1
    };

    const topSegment = (primaryMeasurement - numericalAdjustments.firstSubtractor) +
                       (secondaryMeasurement - numericalAdjustments.secondSubtractor);

    const bottomSegment = secondaryMeasurement - numericalAdjustments.thirdSubtractor;

    return topSegment / bottomSegment;
};

((runtimeEnvironment) => {
    const contentPayload = runtimeEnvironment.require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalCalculatedOutput = computeResultantValue(contentPayload);
    runtimeEnvironment.process.stdout.write(String(finalCalculatedOutput) + '\n');
})(global);