const acquireDataStream = () => {
    const contentLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentOffset = 0;
    const retrieveNextSegment = () => {
        if (currentOffset >= contentLines.length) {
            throw new Error("End of input stream reached.");
        }
        return contentLines[currentOffset++];
    };
    return retrieveNextSegment;
};

const getSegment = acquireDataStream();

const parseInteger = () => parseInt(getSegment());
const parseNumericTuple = () => getSegment().split(" ").map(element => parseInt(element));
const presentResult = (outputValue) => console.log(outputValue);

const computeModuloFactorial = (upperBound, currentModulus) => {
    if (upperBound < 0) return 0; 
    if (upperBound === 0) return 1; 

    return Array.from({ length: upperBound }, (_, idx) => idx + 1)
                .reduce((acc, current) => (acc * current) % currentModulus, 1);
};

const initiateProcessing = () => {
    const [alphaValue, betaValue] = parseNumericTuple();
    const specificModulus = 1000000007; 

    if (Math.abs(alphaValue - betaValue) > 1) {
        presentResult(0);
        return;
    }

    const factorialOfAlpha = computeModuloFactorial(alphaValue, specificModulus);
    const factorialOfBeta = computeModuloFactorial(betaValue, specificModulus);

    let finalProduct = (factorialOfAlpha * factorialOfBeta) % specificModulus;

    if (alphaValue === betaValue) {
        finalProduct = (2 * finalProduct) % specificModulus;
    }
    
    presentResult(finalProduct);
};

initiateProcessing();