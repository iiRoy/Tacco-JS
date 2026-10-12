function Main(input) {
  const lines = input.split("\n");
  const [dimN, dimM, offsetC] = lines[0].split(" ").map(Number);
  const vectorB = lines[1].split(" ").map(Number);
  const matrixA = lines.slice(2, 2 + dimN).map(rowStr => rowStr.split(" ").map(Number));

  const calculatePositiveScores = (rows, weights, constantOffset) => {
    return rows.filter(currentRow => {
      const rowScore = currentRow.reduce((accumulator, currentElement, index) => {
        return accumulator + currentElement * weights[index];
      }, constantOffset);
      return rowScore > 0;
    }).length;
  };

  console.log(calculatePositiveScores(matrixA, vectorB, offsetC));
}

var input = Main(require("fs").readFileSync("/dev/stdin", "utf8"));
