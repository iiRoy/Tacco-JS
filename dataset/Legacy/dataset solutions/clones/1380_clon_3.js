'use strict';

(function(rawInputContent) {
    const HASH_CHAR = '#';
    const DOT_CHAR = '.';
    const NEWLINE_CHAR = '\n';

    const generateRepeatedString = (charToRepeat, count) => {
        if (count <= 0) {
            return '';
        }
        return charToRepeat.repeat(count);
    };

    const extractDimensions = (lineText) => {
        const dimensionParts = lineText.split(' ');
        const extractedWidth = Number(dimensionParts[0]);
        const extractedHeight = Number(dimensionParts[1]);
        return { width: extractedWidth, height: extractedHeight };
    };

    const inputLines = rawInputContent.split(NEWLINE_CHAR);
    let currentLineIndex = 0;
    const totalLinesCount = inputLines.length;

    while (currentLineIndex < totalLinesCount) {
        const currentLine = inputLines[currentLineIndex];
        currentLineIndex++;

        const { width, height } = extractDimensions(currentLine);

        if (width === 0 && height === 0) {
            return false;
        }

        const topBottomBorderLine = generateRepeatedString(HASH_CHAR, width) + NEWLINE_CHAR;

        const middleRowContent = HASH_CHAR + generateRepeatedString(DOT_CHAR, width - 2) + HASH_CHAR + NEWLINE_CHAR;

        const middleSection = generateRepeatedString(middleRowContent, height - 2);

        const constructedFrame = topBottomBorderLine + middleSection + topBottomBorderLine;

        console.log(constructedFrame);
    }
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
