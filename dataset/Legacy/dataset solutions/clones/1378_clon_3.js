var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.split('\n');

var shouldProcessNextBlock = true;

while (shouldProcessNextBlock) {
    var currentLineData = inputLines.shift();
    var dimStrings = currentLineData.split(' ');
    var currentHeight = +dimStrings[0];
    var currentWidth = +dimStrings[1];

    const ZERO_SUM_TERMINATOR = 0;

    if (currentHeight + currentWidth === ZERO_SUM_TERMINATOR) {
        shouldProcessNextBlock = false;
        continue;
    }

    const HASH_CHAR = '#';
    const DOT_CHAR = '.';

    const lastRowIndex = currentHeight - 1;
    const lastColIndex = currentWidth - 1;

    for (var rowIndex = 0; rowIndex < currentHeight; rowIndex++) {
        var rowOutputBuffer = '';

        for (var colIndex = 0; colIndex < currentWidth; colIndex++) {
            var isFirstRow = (rowIndex === 0);
            var isLastRow = (rowIndex === lastRowIndex);
            var isFirstCol = (colIndex === 0);
            var isLastCol = (colIndex === lastColIndex);

            if (isFirstRow || isLastRow || isFirstCol || isLastCol) {
                rowOutputBuffer += HASH_CHAR;
            } else {
                rowOutputBuffer += DOT_CHAR;
            }
        }
        console.log(rowOutputBuffer);
    }
    console.log();
}
