function processData(rawDataString) {
  const parsedLines = rawDataString.split("\n");
  const firstLineContent = parsedLines[0];
  const lineSegments = firstLineContent.split(' ');

  const numNString = lineSegments[0];
  const numKString = lineSegments[1];

  const valueN = parseInt(numNString, 10);
  const valueK = parseInt(numKString, 10);

  let computedResult;
  if (valueK === 1) {
    computedResult = 0;
  } else {
    computedResult = valueN - valueK;
  }

  console.log(computedResult);
}

const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processData(standardInputContent);
