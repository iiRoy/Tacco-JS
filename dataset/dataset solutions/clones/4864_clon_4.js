const processGridInput = (inputString) => {
    const allLines = inputString.split('\n');
    const [_, maxColumnIdentifier] = allLines[0].split(' ');
    const effectiveColumnCount = Number(maxColumnIdentifier);

    const contentRows = allLines.slice(1);

    const parsedGrid = contentRows.map(lineSegment => lineSegment.split(' '));

    parsedGrid.map((currentRow, rowPosition) => {
        const targetCellIndex = currentRow.findIndex(elementValue => elementValue === 'snuke');

        if (targetCellIndex !== -1 && targetCellIndex < effectiveColumnCount) {
            const columnChar = String.fromCharCode(65 + targetCellIndex);
            const rowNumber = rowPosition + 1;
            return `${columnChar}${rowNumber}`;
        }
        return null;
    })
    .filter(Boolean)
    .forEach(resultString => console.log(resultString));
};

processGridInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
