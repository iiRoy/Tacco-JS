function processGridWithBorder(rawInputLines) {
    const BORDER_SYMBOL = '#';
    const BORDER_THICKNESS = 1;

    const allInputLines = rawInputLines.split("\n");

    const dimensionsPart = allInputLines[0].split(" ");
    const actualHeight = parseInt(dimensionsPart[0], 10);
    const actualWidth = parseInt(dimensionsPart[1], 10);

    const totalDisplayHeight = actualHeight + (2 * BORDER_THICKNESS);
    const totalDisplayWidth = actualWidth + (2 * BORDER_THICKNESS);

    const createFullBorderLine = (width) => {
        return BORDER_SYMBOL.repeat(width);
    };

    const createDataLineWithBorders = (contentLine) => {
        return BORDER_SYMBOL + contentLine + BORDER_SYMBOL;
    };

    for (let currentLineIdx = 0; currentLineIdx < totalDisplayHeight; currentLineIdx++) {
        let outputLine;
        const isTopOrBottomBorder = (currentLineIdx === 0 || currentLineIdx === totalDisplayHeight - 1);

        if (isTopOrBottomBorder) {
            outputLine = createFullBorderLine(totalDisplayWidth);
        } else {
            const originalDataRowContent = allInputLines[currentLineIdx].substring(0, actualWidth);
            outputLine = createDataLineWithBorders(originalDataRowContent);
        }
        console.log(outputLine);
    }
}

processGridWithBorder(require("fs").readFileSync("/dev/stdin", "utf8"));
