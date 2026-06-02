const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";
const initialLoopValue = 600;

function processInputLineAndCalculateSum(lineContent) {
    let accumulatedSum = 0;
    const numericValueFromLine = Number(lineContent);

    let loopDecrementingCounter = initialLoopValue;

    while (true) {
        loopDecrementingCounter -= numericValueFromLine;

        if (loopDecrementingCounter === 0) {
            break;
        }

        accumulatedSum += loopDecrementingCounter * loopDecrementingCounter * numericValueFromLine;
    }

    return accumulatedSum;
}

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);

const processedLines = rawFileContent.trim().split('\n');

processedLines.map(function(singleInputLine) {
    const finalResultForLine = processInputLineAndCalculateSum(singleInputLine);
    console.log(finalResultForLine);
});
