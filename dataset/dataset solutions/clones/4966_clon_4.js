const fileSystem = require("node:fs");

const retrieveAndParseInput = (filePathIdentifier) => {
    const rawContentBuffer = fileSystem.readFileSync(filePathIdentifier, { encoding: "utf8" });
    const cleanedString = rawContentBuffer.trim(); 
    const stringComponents = cleanedString.split("\n");
    return stringComponents.map(component => parseFloat(component));
};

const calculateTrapezoidArea = (basisOne, basisTwo, verticalExtent) => {
    const sumOfBases = basisOne + basisTwo;
    const intermediateProduct = sumOfBases * verticalExtent;
    const finalComputation = intermediateProduct * 0.5; 
    return finalComputation;
};

const numericalDataSet = retrieveAndParseInput("/dev/stdin");

const [dimensionA, dimensionB, dimensionH] = numericalDataSet;

const computedFinalValue = calculateTrapezoidArea(dimensionA, dimensionB, dimensionH);

console.log(computedFinalValue);