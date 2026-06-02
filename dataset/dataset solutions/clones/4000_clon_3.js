function processInput(rawData) {
    const dimensionData = parseDimensions(rawData);
    const dimA = dimensionData.firstDimension;
    const dimB = dimensionData.secondDimension;

    let calculatedValue;

    const isAnyDimensionOne = (dimA === 1n || dimB === 1n);

    if (isAnyDimensionOne) {
        const areBothDimensionsOne = (dimA === 1n && dimB === 1n);
        if (areBothDimensionsOne) {
            calculatedValue = 0n;
        } else if (dimA === 1n) {
            calculatedValue = dimB - 2n;
        } else {
            calculatedValue = dimA - 2n;
        }
    } else {
        const effectiveWidth = dimA - 2n;
        const effectiveHeight = dimB - 2n;
        calculatedValue = effectiveWidth * effectiveHeight;
    }

    console.log(calculatedValue.toString());
}

function parseDimensions(inputString) {
    const parts = inputString.split(" ");
    const firstVal = BigInt(parts[0]);
    const secondVal = BigInt(parts[1]);
    return { firstDimension: firstVal, secondDimension: secondVal };
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processInput(fileContent);
