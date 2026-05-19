function calculateMinDifference(rawInputData) {
  const NEWLINE_SPLITTER = "\n";
  const SPACE_SPLITTER = " ";
  const ZERO_VALUE = 0;
  const DIVISOR_FOR_THREE = 3;
  const SIXTH_DENOMINATOR = 6;

  let inputLines = rawInputData.split(NEWLINE_SPLITTER);
  let dimensionStrings = inputLines[ZERO_VALUE].split(SPACE_SPLITTER);

  const heightDim = parseInt(dimensionStrings[ZERO_VALUE], 10);
  const widthDim = parseInt(dimensionStrings[1], 10);

  if (heightDim % DIVISOR_FOR_THREE === ZERO_VALUE || widthDim % DIVISOR_FOR_THREE === ZERO_VALUE) {
    console.log(ZERO_VALUE);
    return;
  }

  let candidateDifferences = [];
  candidateDifferences.push(heightDim);
  candidateDifferences.push(widthDim);

  const calculateComplexExpression = (firstDimension, secondDimension) => {
    return (DIVISOR_FOR_THREE * firstDimension + 2 * secondDimension - 1) / SIXTH_DENOMINATOR;
  };

  if (heightDim % 2 === ZERO_VALUE) {
    candidateDifferences.push(heightDim / 2);
  } else {
    candidateDifferences.push(calculateComplexExpression(heightDim, widthDim));
  }

  if (widthDim % 2 === ZERO_VALUE) {
    candidateDifferences.push(widthDim / 2);
  } else {
    candidateDifferences.push(calculateComplexExpression(widthDim, heightDim));
  }

  let finalMinDifference = Math.min(...candidateDifferences);

  console.log(Math.round(finalMinDifference));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
calculateMinDifference(require("fs").readFileSync("/dev/stdin", "utf8"));
