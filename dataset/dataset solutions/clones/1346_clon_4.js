function processGeometry(rawData) {
    const numericValue = Number.parseInt(rawData, 10);
    const areaCalculation = Math.PI * Math.pow(numericValue, 2);
    const perimeterCalculation = 2 * Math.PI * numericValue;

    const integralArea = Math.trunc(areaCalculation);
    const integralPerimeter = Math.trunc(perimeterCalculation);

    console.log(`${integralArea} ${integralPerimeter}`);
}

processGeometry(require("fs").readFileSync("b.txt", "utf8"));
