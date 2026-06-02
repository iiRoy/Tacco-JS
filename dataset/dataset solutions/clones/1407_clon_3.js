function getInputLines() {
    const inputFilePath = "/dev/stdin";
    const fileSystemUtility = require("fs");
    const fileContentBuffer = fileSystemUtility.readFileSync(inputFilePath, "utf8");
    const lineBreakPattern = /\n\r?/;
    return fileContentBuffer.split(lineBreakPattern);
}

function constructHashGridString(gridHeightDimension, gridWidthDimension) {
    const hashSymbol = '#';
    const singleRowSegment = new Array(gridWidthDimension + 1).join(hashSymbol);
    const rowWithLineFeed = singleRowSegment + "\n";
    const completeGridRepresentation = new Array(gridHeightDimension + 1).join(rowWithLineFeed);
    return completeGridRepresentation;
}

getInputLines().every(function(currentInputLine) {
    const lineDataParts = currentInputLine.split(' ');
    const parsedHeight = +lineDataParts[0];
    const parsedWidth = +lineDataParts[1];

    const isTerminationConditionMet = (parsedHeight === 0 && parsedWidth === 0);

    if (isTerminationConditionMet) {
        return false;
    }

    const finalGridOutput = constructHashGridString(parsedHeight, parsedWidth);
    console.log(finalGridOutput);

    return true;
});
