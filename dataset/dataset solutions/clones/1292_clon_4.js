const fileSystem = require('node:fs');
const standardInputData = fileSystem.readFileSync(0, 'utf8');

const entrySegments = standardInputData.trim().split('\n');

const determineCategory = (scoreAlpha, scoreBeta, scoreGamma) => {
    const combinedScore = scoreAlpha + scoreBeta;

    return (scoreAlpha === -1 || scoreBeta === -1) ? 'F' :
           (combinedScore >= 80) ? 'A' :
           (combinedScore >= 65) ? 'B' :
           (combinedScore >= 50) ? 'C' :
           (combinedScore >= 30) ? (scoreGamma >= 50 ? 'C' : 'D') :
           'F';
};

const processSegmentsRecursively = (remainingSegments, collectedOutcomes = []) => {
    if (remainingSegments.length === 0) {
        return collectedOutcomes;
    }

    const [currentSegment, ...tailSegments] = remainingSegments;

    if (currentSegment === '-1 -1 -1') {
        return collectedOutcomes;
    }

    const [valueOne, valueTwo, valueThree] = currentSegment.split(' ').map(Number);
    const currentCategory = determineCategory(valueOne, valueTwo, valueThree);

    collectedOutcomes.push(currentCategory);

    return processSegmentsRecursively(tailSegments, collectedOutcomes);
};

const finalClassifications = processSegmentsRecursively(entrySegments);

finalClassifications.forEach(classificationResult => console.log(classificationResult));