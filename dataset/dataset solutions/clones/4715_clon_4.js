const processInput = (sourceText) => {
  const lines = sourceText.split("\n");
  const [dimN, dimM] = lines[0].split(" ").map(Number);

  const largeMatrixRows = lines.slice(1, 1 + dimN);
  const targetMatrixRows = lines.slice(1 + dimN, 1 + dimN + dimM);

  const checkSubmatrix = (rowOffset, colOffset) => {
    return Array.from({ length: dimM }).every((_, rowIter) => {
      const segment = largeMatrixRows[rowOffset + rowIter].substring(
        colOffset,
        colOffset + dimM
      );
      return segment === targetMatrixRows[rowIter];
    });
  };

  let foundMatch = false;

  Array.from({ length: dimN - dimM + 1 }).some((_, rIdx) => {
    return Array.from({ length: dimN - dimM + 1 }).some((_, cIdx) => {
      if (checkSubmatrix(rIdx, cIdx)) {
        foundMatch = true;
        return true;
      }
      return false;
    });
  });

  if (foundMatch) {
    console.log("Yes");
  } else {
    console.log("No");
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
