function computePolygonAngles(sourceData) {
    const processedInput = sourceData.trim();
    const polygonSides = Number.parseInt(processedInput, 10);
    const sumOfInteriorAngles = polygonSides * 180 - 360;
    console.log(sumOfInteriorAngles);
}
computePolygonAngles(require("fs").readFileSync("/dev/stdin", "utf8"));
