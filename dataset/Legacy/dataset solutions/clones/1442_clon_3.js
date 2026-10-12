(function (rawDataContent) {
    const DEG_TO_RAD_FACTOR = Math.PI / 180;

    const processedLines = rawDataContent.replace(/\r/g, '').split("\n");

    const parseNumericLine = (lineString) => {
        return lineString.split(" ").map(Number);
    };

    const [sideA, sideB, angleDegrees] = parseNumericLine(processedLines.shift());

    const angleRadians = angleDegrees * DEG_TO_RAD_FACTOR;

    const cosineOfAngle = Math.cos(angleRadians);
    const sineOfAngle = Math.sin(angleRadians);

    const aSquared = sideA * sideA;
    const bSquared = sideB * sideB;

    const cSquaredIntermediate = aSquared + bSquared - (2 * sideA * sideB * cosineOfAngle);
    const sideC = Math.sqrt(cSquaredIntermediate);

    const triangleArea = 0.5 * sideA * sideB * sineOfAngle;

    const trianglePerimeter = sideA + sideB + sideC;

    const triangleHeight = sideB * sineOfAngle;

    console.log(
        triangleArea.toFixed(8) + "\n" +
        trianglePerimeter.toFixed(8) + "\n" +
        triangleHeight.toFixed(8)
    );

})(require("fs").readFileSync("/dev/stdin", "utf8"));
