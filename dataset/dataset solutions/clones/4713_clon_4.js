process.stdin.resume();
process.stdin.setEncoding('ascii');

let rawInputBuffer = "";
let inputLines = [];
let currentLineIndex = 0;

process.stdin.on('data', function (data) {
    rawInputBuffer += data;
});

process.stdin.on('end', function () {
    inputLines = rawInputBuffer.split("\n");
    executePatternSearch();
});

function obtainLine() {
    return inputLines[currentLineIndex++];
}

/////////////// ignore above this line ////////////////////

function executePatternSearch() {
    const dimensionsLineParts = obtainLine().split(" ");
    const mainGridDimension = parseInt(dimensionsLineParts[0]);
    const patternGridDimension = parseInt(dimensionsLineParts[1]);

    const mainGridData = Array.from({ length: mainGridDimension }, () =>
        obtainLine().slice(0, mainGridDimension)
    );

    const patternGridData = Array.from({ length: patternGridDimension }, () =>
        obtainLine().slice(0, patternGridDimension)
    );

    const possibleRowStarts = Array.from({ length: mainGridDimension - patternGridDimension + 1 }, (_, idx) => idx);
    const possibleColStarts = Array.from({ length: mainGridDimension - patternGridDimension + 1 }, (_, idx) => idx);

    const isPatternPresent = possibleRowStarts.some(rowOffset => {
        return possibleColStarts.some(colOffset => {
            const currentSubgridMatches = Array.from({ length: patternGridDimension }, (_, patternRowIdx) => patternRowIdx).every(patternRowIdx => {
                const mainGridSegment = mainGridData[rowOffset + patternRowIdx].slice(colOffset, colOffset + patternGridDimension);
                const patternGridSegment = patternGridData[patternRowIdx];
                return mainGridSegment === patternGridSegment;
            });
            return currentSubgridMatches;
        });
    });

    if (isPatternPresent) {
        process.stdout.write("Yes");
    } else {
        process.stdout.write("No");
    }
    process.exit();
}
