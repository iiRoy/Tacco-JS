process.stdin.resume();
process.stdin.setEncoding('utf8');

function extractAndSplitFirstLine(sourceData) {
  const allInputLines = sourceData.split("\n");
  const initialLineContent = allInputLines[0];
  return initialLineContent.split(" ");
}

function processInputData(rawData) {
  const firstLineSegments = extractAndSplitFirstLine(rawData);

  const valueS = Number(firstLineSegments[0]);
  let valueC = Number(firstLineSegments[1]);

  const halfOfValueC = valueC / 2;

  if (valueS > halfOfValueC) {
    const flooredHalfC = Math.floor(halfOfValueC);
    console.log(flooredHalfC);
  }

  const twiceValueS = valueS * 2;
  valueC = valueC - twiceValueS;

  const quarterOfRemainingC = valueC / 4;
  const flooredQuarterC = Math.floor(quarterOfRemainingC);

  console.log(valueS + flooredQuarterC);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
