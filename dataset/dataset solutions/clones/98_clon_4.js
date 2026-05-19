const fileSystemModule = require("fs");
const sourceData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const dataLines = sourceData.split(/\n/);

let currentPosition = 0;
let processedValue;

for (;;) {
    const lineContent = dataLines[currentPosition];

    if (lineContent === undefined) {
        break;
    }

    processedValue = Number(lineContent);

    if (!processedValue) {
        break;
    }

    const computedResult = Math.floor((processedValue * processedValue / 98) + 2);
    console.log(computedResult);

    currentPosition++;
}
