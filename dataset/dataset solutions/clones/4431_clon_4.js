'use strict';

const getOutputChannel = () => ({
    display: (dataPayload) => process.stdout.write(String(dataPayload) + '\n')
});

const getFileAccessor = (loaderFunction) => ({
    retrieveContents: (resourcePath, textEncoding) => loaderFunction("fs").readFileSync(resourcePath, textEncoding)
});

const performCalculation = () => {
    const outputMechanism = getOutputChannel();
    const dataAcquisitionUnit = getFileAccessor(require);

    const sourceLocation = "/dev/stdin";
    const dataFormat = "utf8";

    const receivedData = dataAcquisitionUnit.retrieveContents(sourceLocation, dataFormat);
    const endOfFirstLine = receivedData.indexOf('\n');
    const initialSegment = (endOfFirstLine === -1) ? receivedData : receivedData.substring(0, endOfFirstLine);

    const numericalPattern = /^\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*$/;
    const identifiedValues = initialSegment.match(numericalPattern);

    if (!identifiedValues || identifiedValues.length < 3) {
        throw new Error("Input data structure mismatch.");
    }

    const valueA = parseFloat(identifiedValues[1]);
    const valueB = parseFloat(identifiedValues[2]);

    const productOfAandB = valueA * valueB;
    const sumOfAandB = valueA + valueB;
    const intermediateResult = productOfAandB - sumOfAandB;
    const finalOutcome = intermediateResult + 1;

    outputMechanism.display(finalOutcome);
};

performCalculation();