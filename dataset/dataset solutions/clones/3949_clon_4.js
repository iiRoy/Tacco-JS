const processGridData = (rawData) => {
  const [firstLine] = rawData.split('\n');
  const [valX, valY] = firstLine.split(' ').map(Number);

  const totalRows = 100;
  const totalCols = 100;

  const currentGridState = Array.from({ length: totalRows }, (_, rowIndex) =>
    Array.from({ length: totalCols }, () => (rowIndex < totalRows / 2 ? '.' : '#'))
  );

  const calculateRowIndex = (idx) => Math.round(idx / 50) * 2;
  const calculateColIndex = (idx) => (idx % 50) * 2;

  Array.from({ length: valY - 1 }).forEach((_, iterationIdx) => {
    const targetRow = calculateRowIndex(iterationIdx);
    const targetCol = calculateColIndex(iterationIdx);
    currentGridState[targetRow][targetCol] = '#';
  });

  Array.from({ length: valX - 1 }).forEach((_, iterationIdx) => {
    const targetRow = totalRows - 1 - calculateRowIndex(iterationIdx);
    const targetCol = calculateColIndex(iterationIdx);
    currentGridState[targetRow][targetCol] = '.';
  });

  const finalOutputLines = currentGridState.map(row => row.join(''));
  const resultString = finalOutputLines.join('\n');

  console.log(resultString);
};

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
