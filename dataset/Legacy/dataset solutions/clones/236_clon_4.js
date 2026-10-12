const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

fileContent.trim().split('\n').forEach(currentLine => {
    const numericValues = currentLine.split(' ').map(Number);

    const [
        coordAX, coordAY,
        coordBX, coordBY,
        coordCX, coordCY,
        coordDX, coordDY
    ] = numericValues;

    const vectorOneX = coordBX - coordAX;
    const vectorOneY = coordBY - coordAY;

    const vectorTwoX = coordDX - coordCX;
    const vectorTwoY = coordDY - coordCY;

    const dotProductResult = (vectorOneX * vectorTwoX) + (vectorOneY * vectorTwoY);

    const comparisonThreshold = 1e-8;

    const areSegmentsOrthogonal = Math.abs(dotProductResult) < comparisonThreshold;

    console.log(areSegmentsOrthogonal ? "YES" : "NO");
});
