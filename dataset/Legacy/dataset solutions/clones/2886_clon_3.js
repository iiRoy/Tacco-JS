function calculatePolygonAngles(rawDataString) {
    const trimmedInput = rawDataString.trim();
    const numberOfSides = parseInt(trimmedInput, 10);

    const DEGREES_PER_TRIANGLE = 180;
    const effectiveSidesForTriangulation = numberOfSides - 2;

    const sumOfInteriorAngles = effectiveSidesForTriangulation * DEGREES_PER_TRIANGLE;

    console.log(sumOfInteriorAngles);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
calculatePolygonAngles(fileContent);
