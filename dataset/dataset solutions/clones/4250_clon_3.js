const processInput = rawData => {
  const DIMENSION_SIZE = 3;
  const cleanedInputString = rawData.trim();
  const characterMatrix = cleanedInputString.split('\n');

  const firstLine = characterMatrix[0];
  const secondLine = characterMatrix[1];

  let comparisonFailed = false;

  for (let columnIndex = 0; columnIndex < DIMENSION_SIZE; columnIndex++) {
    const charFromFirstLine = firstLine.charAt(columnIndex);
    const charFromSecondLine = secondLine.charAt(DIMENSION_SIZE - 1 - columnIndex);

    if (charFromFirstLine !== charFromSecondLine) {
      comparisonFailed = true;
      break;
    }
  }

  if (comparisonFailed) {
    console.log('NO');
  } else {
    console.log('YES');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
