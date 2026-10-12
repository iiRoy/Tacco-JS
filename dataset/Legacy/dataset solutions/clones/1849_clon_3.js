function processInputData(rawData) {
  const inputLines = rawData.split('\n');

  const firstLineTrimmed = inputLines[0].trim();
  const maxLen = parseInt(firstLineTrimmed, 10);

  const targetString = inputLines[1].trim();

  const ellipsisConstant = '...';
  let resultString;

  if (targetString.length <= maxLen) {
    resultString = targetString;
  } else {
    const truncatedSegment = targetString.substring(0, maxLen);
    resultString = truncatedSegment + ellipsisConstant;
  }

  console.log(resultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
