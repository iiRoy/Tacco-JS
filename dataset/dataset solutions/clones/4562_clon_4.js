function processGrid(rawInput) {
    const lines = rawInput.split("\n");
    const [heightDimension, widthDimension] = lines[0].split(" ");
    const actualHeight = parseInt(heightDimension, 10);
    const actualWidth = parseInt(widthDimension, 10);

    const generatedRows = Array.from({ length: actualHeight + 2 }, (_, rowIndex) => {
        const rowContent = Array.from({ length: actualWidth + 2 }, (__, colIndex) => {
            if (rowIndex === 0 || rowIndex === actualHeight + 1) {
                return '#';
            } else if (colIndex === 0 || colIndex === actualWidth + 1) {
                return '#';
            } else {
                return lines[rowIndex][colIndex - 1];
            }
        });
        return rowContent.join('');
    });

    generatedRows.forEach(outputLine => console.log(outputLine));
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
