function processData(sourceText) {
    const textSegments = sourceText.split('\n');
    const accessPoints = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 }
    ];

    const selectedSymbols = accessPoints.map(point => {
        const targetLine = textSegments[point.row];
        return targetLine ? targetLine[point.col] : undefined;
    });

    console.log(selectedSymbols.join(''));
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
