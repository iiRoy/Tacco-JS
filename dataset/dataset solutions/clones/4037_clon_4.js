function processInputData(rawData) {
  const [initialLine] = rawData.split('\n');
  const [valAStr, valBStr] = initialLine.split(' ');

  const valA = Number(valAStr);
  const valB = Number(valBStr);

  const divisionResult = valA / valB;
  const finalOutcome = Number.isInteger(divisionResult) ? -1 : valA;

  console.log('%s', finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
