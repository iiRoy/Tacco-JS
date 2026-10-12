const fileSystem = require("fs");
const standardInputPath = "/dev/stdin";

const rawContent = fileSystem.readFileSync(standardInputPath, "utf8");
const dataLines = rawContent.trim().split('\n');

const initialConstant = 600;

for (const currentLine of dataLines) {
    const parsedNumber = Number(currentLine);

    let accumulatedResult = 0;
    let dynamicCounter = initialConstant;

    while (true) {
        dynamicCounter -= parsedNumber;
        if (!dynamicCounter) {
            break;
        }
        accumulatedResult += dynamicCounter * dynamicCounter * parsedNumber;
    }
    console.log(accumulatedResult);
}
