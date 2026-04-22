const acquireDataStream = require('node:fs').readFileSync;

const processGeometryData = (rawData) => {
    const pointsData = rawData.trim().split('\n');

    const evaluateOrthogonality = (coordinateSet) => {
        const c1x = coordinateSet[0];
        const c1y = coordinateSet[1];
        const c2x = coordinateSet[2];
        const c2y = coordinateSet[3];
        const c3x = coordinateSet[4];
        const c3y = coordinateSet[5];
        const c4x = coordinateSet[6];
        const c4y = coordinateSet[7];

        const vectorOneX = c2x - c1x;
        const vectorOneY = c2y - c1y;
        const vectorTwoX = c4x - c3x;
        const vectorTwoY = c4y - c3y;

        const scalarProduct = (vectorOneX * vectorTwoX) + (vectorOneY * vectorTwoY);

        const numericalPrecisionThreshold = 1e-10;

        return Math.abs(scalarProduct) < numericalPrecisionThreshold ? "YES" : "NO";
    };

    const outcomes = pointsData.map(entry => {
        const numberSequence = entry.split(" ").map(Number);
        return evaluateOrthogonality(numberSequence);
    });

    return outcomes.join('\n');
};

const rawInputContent = acquireDataStream('/dev/stdin', 'utf8');
console.log(processGeometryData(rawInputContent));