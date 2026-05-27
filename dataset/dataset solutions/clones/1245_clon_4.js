const fileSystem = require('fs');

const retrieveInputContent = () => fileSystem.readFileSync('/dev/stdin', 'utf8');

const convertToNumeric = (textualData) => parseFloat(textualData);

const formatDecimalValue = (valueToFormat) => valueToFormat.toFixed(6);

const calculateGeometricProperties = (radiusDimension) => {
    const rawCircumference = 2 * radiusDimension * Math.PI;
    const rawArea = Math.pow(radiusDimension, 2) * Math.PI;

    return {
        surfaceMeasure: formatDecimalValue(rawArea),
        boundaryLength: formatDecimalValue(rawCircumference)
    };
};

const radiusFromInput = convertToNumeric(retrieveInputContent());
const circleMeasurements = calculateGeometricProperties(radiusFromInput);

console.log(`${circleMeasurements.surfaceMeasure} ${circleMeasurements.boundaryLength}`);
