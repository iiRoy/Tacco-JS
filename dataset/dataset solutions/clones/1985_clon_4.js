const retrieveCommonProperty = (numX, numY, numZ) => {
    const upperBound = Math.min(numX, numY, numZ);
    for (let divisorCandidate = upperBound; divisorCandidate >= 1; divisorCandidate--) {
        const isCommonDivisor = (numX % divisorCandidate === 0 && numY % divisorCandidate === 0 && numZ % divisorCandidate === 0);
        const isSpecialCondition = (divisorCandidate <= 2 || divisorCandidate % 2 !== 0);
        if (isCommonDivisor && isSpecialCondition) {
            return divisorCandidate;
        }
    }
    return 1; // Fallback, though 1 always satisfies the conditions
};

const calculateTotalValue = (rawInputData) => {
    const processingLimit = parseInt(rawInputData, 10);
    const sequenceNumbers = Array.from({ length: processingLimit }, (_, index) => index + 1);

    const finalAccumulation = sequenceNumbers.reduce((currentSumX, currentX) => {
        return currentSumX + sequenceNumbers.reduce((currentSumY, currentY) => {
            return currentSumY + sequenceNumbers.reduce((currentSumZ, currentZ) => {
                return currentSumZ + retrieveCommonProperty(currentX, currentY, currentZ);
            }, 0);
        }, 0);
    }, 0);
    
    console.log(finalAccumulation);
};

const inputDataStream = require("fs").readFileSync("/dev/stdin", "utf8");
calculateTotalValue(inputDataStream);