function processInputData(rawInputString) {
  const linesOfInput = rawInputString.split("\n");
  const firstLineData = linesOfInput[0];
  const numericalParts = firstLineData.split(" ");

  const valA = parseInt(numericalParts[0], 10);
  const valB = parseInt(numericalParts[1], 10);

  const doubleValA = valA * 2;

  if (doubleValA >= valB) {
    const calculatedResultOne = Math.floor(valB / 2);
    console.log(calculatedResultOne);
    return;
  }

  const remainingValue = valB - doubleValA;
  const calculatedResultTwo = valA + Math.floor(remainingValue / 4);
  console.log(calculatedResultTwo);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
