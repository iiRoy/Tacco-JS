const checkAllDots = (segment) => segment.every(char => char === '.');

const rotateMatrix = (matrix) => matrix[0].map((_, colIdx) => matrix.map(row => row[colIdx]));

((rawData) => {
    const allLines = rawData.split("\n");

    const initialCharacterGrid = allLines.slice(1).map(line => line.split(''));
    const rowFilteredCharacterGrid = initialCharacterGrid.filter(row => !checkAllDots(row));

    const transposedForColumnFiltering = rotateMatrix(rowFilteredCharacterGrid);

    const columnFilteredTransposedGrid = transposedForColumnFiltering.filter(column => !checkAllDots(column));

    const finalProcessedGrid = rotateMatrix(columnFilteredTransposedGrid);

    finalProcessedGrid.forEach(row => console.log(row.join('')));

})(require("fs").readFileSync("/dev/stdin", "utf8"));
