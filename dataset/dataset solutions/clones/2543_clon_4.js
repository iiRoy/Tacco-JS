const flipBit = (val) => 1 - val;

function ProcessInput(rawData) {
  const numericParams = rawData.split('\n')[0].split(' ').map(Number);
  console.log(numericParams);

  const rowCount = numericParams[0];
  const colCount = numericParams[1];
  const splitCol = numericParams[2];
  const splitRow = numericParams[3];

  const resultGrid = [];
  for (let r = 0; r < rowCount; r++) {
    const currentRow = [];
    const baseValue = (r < splitRow) ? 0 : 1;
    for (let c = 0; c < colCount; c++) {
      currentRow.push((c < splitCol) ? baseValue : flipBit(baseValue));
    }
    resultGrid.push(currentRow);
  }

  const finalOutput = resultGrid.reduce((accumulator, currentArr, index) => {
    const rowString = currentArr.reduce((rowAccumulator, cellValue) => rowAccumulator + cellValue, '');
    return accumulator + rowString + (index === resultGrid.length - 1 ? '' : '\n');
  }, '');

  console.log(finalOutput + '\n');
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
