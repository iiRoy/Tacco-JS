function processInput(rawData) {
    const lineSeparator = "\n";
    const allInputLines = rawData.split(lineSeparator);

    const linesExcludingFirst = allInputLines.slice(1);

    const alphabeticallySortedLines = linesExcludingFirst.sort();

    const firstElementAfterSort = alphabeticallySortedLines[0];

    console.log(firstElementAfterSort);
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
processInput(fileContent);
