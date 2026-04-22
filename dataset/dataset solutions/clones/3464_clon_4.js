const extractNumeric = (textualRepresentation) => Number(textualRepresentation);

const determineOptimalOutcome = (rawData) => {
    const contentLines = rawData.split('\n');
    const totalElements = extractNumeric(contentLines[0]);
    const elementValues = contentLines.slice(1, totalElements + 1).map(extractNumeric);

    elementValues.sort((first, second) => first - second);

    let calculatedScoreA = 0;
    let calculatedScoreB = 0;

    if (totalElements % 2 === 0) {
        const midPoint = totalElements / 2;
        
        const sumLeftHalf = elementValues.slice(0, midPoint).reduce((accum, val) => accum - 2 * val, 0);
        const sumRightHalf = elementValues.slice(midPoint).reduce((accum, val) => accum + 2 * val, 0);
        
        calculatedScoreA = sumLeftHalf + sumRightHalf + elementValues[midPoint - 1] - elementValues[midPoint];

    } else {
        const centerIndex = Math.floor(totalElements / 2);

        // Calculate score A (corresponds to original 'x' in the odd case)
        const initialSumForX = elementValues.slice(0, centerIndex).reduce((accum, val) => accum - 2 * val, 0) +
                               elementValues.slice(centerIndex).reduce((accum, val) => accum + 2 * val, 0);
        calculatedScoreA = initialSumForX - elementValues[centerIndex] - elementValues[centerIndex + 1];

        // Calculate score B (corresponds to original 'y' in the odd case)
        const initialSumForY = elementValues.slice(0, centerIndex + 1).reduce((accum, val) => accum - 2 * val, 0) +
                               elementValues.slice(centerIndex + 1).reduce((accum, val) => accum + 2 * val, 0);
        calculatedScoreB = initialSumForY + elementValues[centerIndex] + elementValues[centerIndex - 1];
    }

    const ultimateResult = Math.max(calculatedScoreA, calculatedScoreB);
    console.log(ultimateResult);
};

(() => {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    determineOptimalOutcome(inputContent);
})();