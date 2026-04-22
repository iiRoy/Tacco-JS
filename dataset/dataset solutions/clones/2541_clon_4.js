function processGridPattern(inputData) {
    const inputLines = inputData.split('\n');
    const firstLineParams = inputLines[0].split(' ');

    const rowDimension = parseInt(firstLineParams[0], 10);
    const colDimension = parseInt(firstLineParams[1], 10);
    const colSplitPoint = parseInt(firstLineParams[2], 10);
    const rowSplitPoint = parseInt(firstLineParams[3], 10);

    const gridResult = Array.from({ length: rowDimension }, (_, rowIndex) => {
        return Array.from({ length: colDimension }, (_, colIndex) => {
            const isRowAboveSplit = rowIndex < rowSplitPoint;
            const isColLeftOfSplit = colIndex < colSplitPoint;
            
            // This boolean expression computes the value based on the quadrant:
            // Top-Left (true, true) -> false -> 0
            // Top-Right (true, false) -> true -> 1
            // Bottom-Left (false, true) -> true -> 1
            // Bottom-Right (false, false) -> false -> 0
            return (isRowAboveSplit !== isColLeftOfSplit) ? 1 : 0;
        }).join('');
    });

    console.log(gridResult.join('\n'));
}

processGridPattern(require('fs').readFileSync('/dev/stdin', 'utf8'));