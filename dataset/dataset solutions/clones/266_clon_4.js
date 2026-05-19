const fileSystem = require("fs");

function* generateNumericPairs(sourceTokens) {
    let currentPosition = 0;
    while (true) {
        const firstComponent = Number(sourceTokens[currentPosition]);
        const secondComponent = Number(sourceTokens[currentPosition + 1]);
        if (firstComponent * secondComponent === 0) {
            return;
        }
        yield [firstComponent, secondComponent];
        currentPosition += 2;
    }
}

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputStringSegments = rawInputContent.split(/\s/);

for (const [valX, valY] of generateNumericPairs(inputStringSegments)) {
    const squareOfX = valX * valX;
    const computedResult = valX * Math.sqrt(4 * valY * valY + squareOfX) + squareOfX;
    console.log(computedResult);
}
