const processShapeData = (dimensionInput) => {
    const numericDimension = parseFloat(dimensionInput);
    const mathematicalConstant = Math.PI;

    const shapeMetrics = {
        surfaceArea: mathematicalConstant * numericDimension * numericDimension,
        boundaryLength: mathematicalConstant * 2 * numericDimension,
    };

    console.log(`${shapeMetrics.surfaceArea} ${shapeMetrics.boundaryLength}`);
};

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
processShapeData(rawInputData);
