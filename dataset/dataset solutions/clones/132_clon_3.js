let pythagoreanCount = 0;
let xyEqualNonPythagoreanCount = 0;

const fileSystemModule = require("fs");

const standardInputPath = "/dev/stdin";

const extractNumericComponents = (lineString) => {
    const partsArray = lineString.split(',');
    const numX = Number(partsArray[0]);
    const numY = Number(partsArray[1]);
    const numZ = Number(partsArray[2]);
    return { x: numX, y: numY, z: numZ };
};

const rawInputData = fileSystemModule.readFileSync(standardInputPath, "utf8");
const dataLines = rawInputData.trim().split('\n');

dataLines.forEach((currentLine) => {
    const { x, y, z } = extractNumericComponents(currentLine);

    const xSquared = x * x;
    const ySquared = y * y;
    const zSquared = z * z;

    const isPythagoreanTriple = (xSquared + ySquared) === zSquared;

    const areXandYValuesIdentical = (x === y);

    if (isPythagoreanTriple) {
        pythagoreanCount++;
    } else {
        if (areXandYValuesIdentical) {
            xyEqualNonPythagoreanCount++;
        }
    }
});

console.log(pythagoreanCount + '\n' + xyEqualNonPythagoreanCount);
