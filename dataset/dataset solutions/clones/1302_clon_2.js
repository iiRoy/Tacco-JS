Object.defineProperties(Array.prototype, {
  toNumberArray: {
    value: function () {
      return this.map(itemValue => Number(itemValue));
    },
  },
  transposeMatrix: {
    value: function () {
      let resultGrid = this[0].map(elementVal => [elementVal]);
      this.slice(1).forEach(currentArrayRow => {
        currentArrayRow.forEach((cellContent, cellIndex) => resultGrid[cellIndex].push(cellContent));
      });
      return resultGrid;
    }
  }
});
((inputStringData) => {
  let rowsCount, colsCount, depthCount, matrixA, matrixB, finalOutputLines = [];
  inputStringData = inputStringData.replaceAll('\n', ',');
  [rowsCount, colsCount, depthCount] = inputStringData.split(/[ ,]/).toNumberArray();
  [matrixA, matrixB] = ((inputLineSegments) => {
    return [
      inputLineSegments.slice(0, rowsCount).map(strValue => strValue.split(' ').toNumberArray()),
      inputLineSegments.slice(rowsCount).map(strValue => strValue.split(' ').toNumberArray())
    ];
  })(inputStringData.split(',').slice(1));
  matrixB = matrixB.transposeMatrix();
  for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    const currentResultRow = [];
    for (let colIndex = 0; colIndex < depthCount; colIndex++) {
      currentResultRow.push(matrixA[rowIndex].reduce((accumulator, currentValue, currentIndex) => {
        return accumulator + currentValue * matrixB[colIndex][currentIndex];
      }, 0.0));
    }
    finalOutputLines.push(currentResultRow.join(' '));
  }
  console.info(finalOutputLines.join('\n'));
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));