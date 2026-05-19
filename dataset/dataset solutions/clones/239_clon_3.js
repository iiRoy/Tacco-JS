const fileSystem = require("fs");

const inputDataArray = fileSystem.readFileSync("/dev/stdin", "utf8").split(/\s/);

let dataPointer = 0;

const parseNextNumber = (sourceArray, currentPointer) => {
    return Number(sourceArray[currentPointer]);
};

const checkRectangleOverlap = (
    rect1X1, rect1Y1, rect1X2, rect1Y2,
    rect2X1, rect2Y1, rect2X2, rect2Y2
) => {
    const xOverlapCondition = (rect1X1 <= rect2X2) && (rect2X1 <= rect1X2);
    const yOverlapCondition = (rect1Y1 <= rect2Y2) && (rect2Y1 <= rect1Y2);
    return xOverlapCondition && yOverlapCondition;
};

while (true) {
    const currentRect1X1 = parseNextNumber(inputDataArray, dataPointer++);
    const currentRect1Y1 = parseNextNumber(inputDataArray, dataPointer++);
    const currentRect1X2 = parseNextNumber(inputDataArray, dataPointer++);
    const currentRect1Y2 = parseNextNumber(inputDataArray, dataPointer++);
    const currentRect2X1 = parseNextNumber(inputDataArray, dataPointer++);
    const currentRect2Y1 = parseNextNumber(inputDataArray, dataPointer++);
    const currentRect2X2 = parseNextNumber(inputDataArray, dataPointer++);
    const currentRect2Y2 = parseNextNumber(inputDataArray, dataPointer++);

    // The original loop condition `h=+i[j++]` means the loop continues as long as `h` is truthy.
    // If `h` is `0` or `NaN` (from `undefined` or `""` input), the loop terminates *before*
    // the `console.log` for that iteration.
    if (!currentRect2Y2) {
        break;
    }

    const isOverlapping = checkRectangleOverlap(
        currentRect1X1, currentRect1Y1, currentRect1X2, currentRect1Y2,
        currentRect2X1, currentRect2Y1, currentRect2X2, currentRect2Y2
    );

    console.log(isOverlapping ? 'YES' : 'NO');
}
