const processInput = (rawInput) => {
    const lines = rawInput.split('\n');

    const [gridHeight, gridWidth] = lines[0].split(' ').map(Number);
    const colorCount = Number(lines[1]);
    const segmentLengths = lines[2].split(' ').map(Number);

    const colorSequence = segmentLengths.flatMap((lengthValue, colorIndex) =>
        Array.from({ length: lengthValue }, () => colorIndex + 1)
    );

    const rowStrings = Array.from({ length: gridHeight }, (_, rowIndex) => {
        const rowStartOffset = rowIndex * gridWidth;
        const currentRowSegment = colorSequence.slice(rowStartOffset, rowStartOffset + gridWidth);

        const processedRow = (rowIndex % 2 === 0)
            ? currentRowSegment
            : currentRowSegment.reverse();

        return processedRow.join(' ');
    });

    const finalGridOutput = rowStrings.join('\n');

    console.log(finalGridOutput);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
