const analyzeGeometricData = (rawData) => {
    const numericTokens = rawData.match(/-?\d+/g).map(Number);

    const totalPointsExpected = numericTokens[0];
    const radialLimit = numericTokens[1];

    const spatialVectors = numericTokens.slice(2).reduce((accumulator, current, index, array) => {
        if (index % 2 === 0) {
            accumulator.push([current, array[index + 1]]);
        }
        return accumulator;
    }, []);

    const boundarySquare = radialLimit * radialLimit;

    const qualifyingElements = spatialVectors.filter(vector => {
        const primaryComponent = vector[0];
        const secondaryComponent = vector[1];
        const squaredMagnitude = (primaryComponent * primaryComponent) + (secondaryComponent * secondaryComponent);
        return squaredMagnitude <= boundarySquare;
    });

    console.log(qualifyingElements.length);
};

const sourceProvider = require('fs').readFileSync('/dev/stdin', 'utf8');
analyzeGeometricData(sourceProvider.trim());