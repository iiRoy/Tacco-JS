function processInputData(rawData) {
  const dataPoints = rawData.match(/\d+/g).map(Number);

  const firstVal = dataPoints[0];
  const secondVal = dataPoints[1];
  const thirdVal = dataPoints[2];

  const isThirdValueAtLeastFirst = (Math.min(firstVal, thirdVal) === firstVal);
  const isThirdValueAtMostSecond = (Math.max(secondVal, thirdVal) === secondVal);

  const finalOutcome = isThirdValueAtLeastFirst && isThirdValueAtMostSecond;

  const resultMapping = new Map([
    [true, 'Yes'],
    [false, 'No']
  ]);

  console.log(resultMapping.get(finalOutcome));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));