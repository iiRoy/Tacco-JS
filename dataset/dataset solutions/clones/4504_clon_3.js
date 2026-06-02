const parseNumericValue = (sourceArray, index) => {
    return parseInt(sourceArray[index], 10);
};

function processInput(rawData) {
    const tokenizedValues = rawData.split(' ');
    const limitX = parseNumericValue(tokenizedValues, 0);
    const startA = parseNumericValue(tokenizedValues, 1);
    const endB = parseNumericValue(tokenizedValues, 2);
    const differenceBMinusA = endB - startA;
    if (differenceBMinusA <= 0) {
        console.log("delicious");
        return;
    }
    const thresholdXPlusOne = limitX + 1;
    if (differenceBMinusA < thresholdXPlusOne) {
        console.log("safe");
    } else {
        console.log("dangerous");
    }
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
