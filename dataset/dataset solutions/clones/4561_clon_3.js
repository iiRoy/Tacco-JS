function renderFramedGrid() {
    const GRID_FRAME_CHARACTER = '#';
    const INPUT_LINE_DELIMITER = '\n';
    const DIMENSION_VALUE_SEPARATOR = ' ';
    const STANDARD_INPUT_FILE_DESCRIPTOR = 0;

    const fileSystem = require('fs');
    let rawInputContentBuffer;
    try {
        rawInputContentBuffer = fileSystem.readFileSync(STANDARD_INPUT_FILE_DESCRIPTOR, 'utf8');
    } catch (readError) {
        console.error("FATAL ERROR: Failed to read from standard input. Details:", readError.message);
        process.exit(1);
    }

    const rawInputContentRows = rawInputContentBuffer.split(INPUT_LINE_DELIMITER);

    if (rawInputContentRows.length < 1 || rawInputContentRows[0].trim().length === 0) {
        console.error("ERROR: Input data is empty or the first line (dimensions) is missing/empty.");
        process.exit(1);
    }

    const dimensionTokens = rawInputContentRows[0]
                                .trim()
                                .split(DIMENSION_VALUE_SEPARATOR)
                                .filter(token => token.length > 0);

    if (dimensionTokens.length < 2) {
        console.error("ERROR: Insufficient dimension values on the first line. Expected at least two numbers (height width).");
        process.exit(1);
    }

    const gridRowsCount = parseInt(dimensionTokens[0], 10);
    const gridColumnsCount = parseInt(dimensionTokens[1], 10);

    if (isNaN(gridRowsCount) || gridRowsCount <= 0 || isNaN(gridColumnsCount) || gridColumnsCount <= 0) {
        console.error(`ERROR: Invalid grid dimensions provided. Height: '${dimensionTokens[0]}', Width: '${dimensionTokens[1]}'. Both must be positive integers.`);
        process.exit(1);
    }

    const totalFrameWidth = gridColumnsCount + 2;

    const horizontalBorderSegment = GRID_FRAME_CHARACTER.repeat(totalFrameWidth);

    const finalOutputLines = [];

    finalOutputLines.push(horizontalBorderSegment);

    const actualContentLineCount = rawInputContentRows.length - 1;

    if (actualContentLineCount < gridRowsCount) {
        console.warn(`WARNING: Expected ${gridRowsCount} content rows based on dimensions, but found only ${actualContentLineCount} actual data lines. Processing available content.`);
    }

    for (let currentLineIndex = 1; currentLineIndex <= gridRowsCount && currentLineIndex < rawInputContentRows.length; currentLineIndex++) {
        let currentContentLine = rawInputContentRows[currentLineIndex].trim();

        if (currentContentLine.length > gridColumnsCount) {
            console.warn(`WARNING: Content line ${currentLineIndex} is longer than the specified width (${gridColumnsCount} characters). It will be truncated.`);
            currentContentLine = currentContentLine.substring(0, gridColumnsCount);
        } else if (currentContentLine.length < gridColumnsCount) {
            console.warn(`WARNING: Content line ${currentLineIndex} is shorter than the specified width (${gridColumnsCount} characters). It will be padded with spaces.`);
            currentContentLine = currentContentLine.padEnd(gridColumnsCount, ' ');
        }

        finalOutputLines.push(`${GRID_FRAME_CHARACTER}${currentContentLine}${GRID_FRAME_CHARACTER}`);
    }

    finalOutputLines.push(horizontalBorderSegment);

    console.log(finalOutputLines.join(INPUT_LINE_DELIMITER));
}

renderFramedGrid();