function processInput(currentValue) {
    const numericRepresentation = Number(currentValue);
    const calculatedSquare = numericRepresentation * numericRepresentation;
    console.log(calculatedSquare);
}

const fileSystemHandler = require("fs");
const standardInputSource = "/dev/stdin";
const rawContentBuffer = fileSystemHandler.readFileSync(standardInputSource, "utf8");

processInput(rawContentBuffer);
