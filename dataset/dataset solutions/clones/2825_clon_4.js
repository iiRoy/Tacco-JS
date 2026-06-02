function processDimensionsAndCoordinates(sourceData) {
    const numericValues = sourceData.trim().split(/\s+/).map(val => +val);
    const [rectWidth, rectHeight, currentX, currentY] = numericValues;

    const quarterRectangleArea = (rectWidth * rectHeight) / 4;

    const isMidpoint = (currentX === rectWidth / 2 && currentY === rectHeight / 2) ? 1 : 0;

    console.log(quarterRectangleArea, isMidpoint);
}

processDimensionsAndCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
