const fileSystemModule = require("fs");
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLinesArray = rawInputContent.split('\n');
const processedLines = inputLinesArray.filter(function(lineSegment) {
    return lineSegment.length > 0;
});
for (const currentLineString of processedLines) {
    const numericValue = Number(currentLineString);
    const squaredValue = Math.pow(numericValue, 2);
    const dividedValue = squaredValue / 98;
    const finalCalculatedValue = Math.floor(dividedValue + 2);
    console.log(finalCalculatedValue);
}
