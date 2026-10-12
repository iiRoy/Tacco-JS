const fileSystemModule = require("fs");
const fileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const dataSegments = fileContent.split(/\s/);

let segmentPointer = 0;
let currentSegmentValue;

while (currentSegmentValue = dataSegments[segmentPointer++]) {
    const numericInput = Number(currentSegmentValue);
    const calculatedOutput = (numericInput * numericInput + numericInput + 2) / 2;
    console.log(calculatedOutput);
}
