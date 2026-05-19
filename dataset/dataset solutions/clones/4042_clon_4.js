function processInputData(rawData) {
  const lineSegments = rawData.split('\n');
  const elementCount = Number(lineSegments[0]);
  const firstSequenceStrings = lineSegments[1].split(' ');
  const secondSequenceStrings = lineSegments[2].split(' ');

  const sumOfFirsts = firstSequenceStrings.reduce((currentTotal, stringValue) => currentTotal + Number(stringValue), 0);
  const sumOfSeconds = secondSequenceStrings.reduce((currentTotal, stringValue) => currentTotal + Number(stringValue), 0);

  const overallDifference = sumOfSeconds - sumOfFirsts;

  const outcomeText = (overallDifference % 2 !== 0) ? "Yes" : "No";

  console.log("%s", outcomeText);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
