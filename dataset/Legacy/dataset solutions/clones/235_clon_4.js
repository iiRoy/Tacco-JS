const retrieveSourceData = require("fs").readFileSync;

const processInputLines = (inputContent) => {
    const trimmedContent = inputContent.trim();
    return trimmedContent.split('\n');
};

const extractNumericComponents = (textLine) => {
    return textLine.split(' ').map(Number);
};

const formVectorFromPoints = (startX, startY, endX, endY) => {
    return {
        deltaX: endX - startX,
        deltaY: endY - startY
    };
};

const computeScalarProduct = (vectorOne, vectorTwo) => {
    return (vectorOne.deltaX * vectorTwo.deltaX) + (vectorOne.deltaY * vectorTwo.deltaY);
};

const orthogonalityThreshold = 1e-10;

const rawData = retrieveSourceData("/dev/stdin", "utf8");
const dataLines = processInputLines(rawData);

dataLines.forEach(individualLine => {
    const coordinateSet = extractNumericComponents(individualLine);

    const x1 = coordinateSet[0];
    const y1 = coordinateSet[1];
    const x2 = coordinateSet[2];
    const y2 = coordinateSet[3];
    const x3 = coordinateSet[4];
    const y3 = coordinateSet[5];
    const x4 = coordinateSet[6];
    const y4 = coordinateSet[7];

    const vectorAtoB = formVectorFromPoints(x1, y1, x2, y2);
    const vectorCtoD = formVectorFromPoints(x3, y3, x4, y4);

    const dotProductResult = computeScalarProduct(vectorAtoB, vectorCtoD);

    if (Math.abs(dotProductResult) < orthogonalityThreshold) {
        console.log('NO');
    } else {
        console.log('YES');
    }
});
