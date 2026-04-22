function parseInputContent(contentSource) {
    const lines = contentSource.split('\n').filter(Boolean);
    const [headerLine, ...gridLines] = lines;
    const [hDimensionStr, wDimensionStr] = headerLine.split(' ');

    const initialHeight = parseInt(hDimensionStr, 10);
    const initialWidth = parseInt(wDimensionStr, 10);

    const characterMap = gridLines.map(rowText => rowText.split(''));

    return {
        initialHeight: initialHeight,
        initialWidth: initialWidth,
        characterMap: characterMap
    };
}

function invertGridAxes(sourceGrid) {
    if (!sourceGrid || sourceGrid.length === 0 || sourceGrid[0].length === 0) {
        return [];
    }
    const currentHeight = sourceGrid.length;
    const currentWidth = sourceGrid[0].length;

    return Array.from({ length: currentWidth }, (_, colIdx) =>
        Array.from({ length: currentHeight }, (_, rowIdx) => sourceGrid[rowIdx][colIdx])
    );
}

const BLANK_INDICATOR = 'n';
const WHITE_SPACE_CELL = '.';

function markBlankLines(gridDataParam) {
    return gridDataParam.map(currentLine => {
        const isLineCompletelyBlank = currentLine.every(
            cellVal => cellVal === WHITE_SPACE_CELL || cellVal === BLANK_INDICATOR
        );
        
        if (isLineCompletelyBlank) {
            return currentLine.map(() => BLANK_INDICATOR);
        } else {
            return currentLine;
        }
    });
}

function processVisualGrid(gridDetails) {
    let currentVisualization = gridDetails.characterMap;

    currentVisualization = markBlankLines(currentVisualization);
    currentVisualization = invertGridAxes(currentVisualization);
    currentVisualization = markBlankLines(currentVisualization);
    currentVisualization = invertGridAxes(currentVisualization);

    return currentVisualization;
}

function generateOutputString(finalGridResult) {
    const printableLines = finalGridResult.flatMap(lineSegment => {
        const hasVisibleContent = lineSegment.some(cellValue => cellValue !== BLANK_INDICATOR);

        if (hasVisibleContent) {
            return [lineSegment.filter(cellValue => cellValue !== BLANK_INDICATOR).join('')];
        } else {
            return [];
        }
    });

    return printableLines.join('\n');
}

function initiateProcessing(rawInputContent) {
    const initialGridData = parseInputContent(rawInputContent);
    const finalGridState = processVisualGrid(initialGridData);
    return generateOutputString(finalGridState);
}

console.log(initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8")));