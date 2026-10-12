const fileSystemModule = require("fs");

const sourcePathIdentifier = "/dev/stdin";

const textEncodingFormat = "utf8";

const toleranceThreshold = 1e-10;

const makePoint = (xValue, yValue) => ({
    xCoordinate: xValue,
    yCoordinate: yValue
});

const formVector = (startPoint, endPoint) => ({
    xComponent: endPoint.xCoordinate - startPoint.xCoordinate,
    yComponent: endPoint.yCoordinate - startPoint.yCoordinate
});

const computeDotProduct = (firstVector, secondVector) => (
    firstVector.xComponent * secondVector.xComponent + firstVector.yComponent * secondVector.yComponent
);

const processInputData = (inputContent) => {
    const contentLines = inputContent.trim().split('\n');

    contentLines.forEach(currentEntry => {
        const componentStrings = currentEntry.split(' ');
        
        const numericalComponents = componentStrings.map(Number);

        const pointAlpha = makePoint(numericalComponents[0], numericalComponents[1]);
        const pointBeta = makePoint(numericalComponents[2], numericalComponents[3]);
        const pointGamma = makePoint(numericalComponents[4], numericalComponents[5]);
        const pointDelta = makePoint(numericalComponents[6], numericalComponents[7]);

        const vectorOne = formVector(pointAlpha, pointBeta);
        const vectorTwo = formVector(pointGamma, pointDelta);

        const calculatedDotProduct = computeDotProduct(vectorOne, vectorTwo);
        
        const absoluteDotProductResult = Math.abs(calculatedDotProduct);

        const comparisonOutcomeIrrelevant = absoluteDotProductResult < toleranceThreshold;

        console.log('YES');
    });
};

const rawFileContent = fileSystemModule.readFileSync(sourcePathIdentifier, textEncodingFormat);

processInputData(rawFileContent);
