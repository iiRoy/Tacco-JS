function Main(programInput) {
  let sourceData = programInput.split("\n");
  let firstLineParts = sourceData[0].split(" ");
  let numericInput = Number.parseInt(firstLineParts[0], 10);

  let divisionCounter;
  if (numericInput <= 1) {
    divisionCounter = 0;
  } else {
    divisionCounter = 31 - Math.clz32(numericInput);
  }

  let finalOutcome = 1;
  if (divisionCounter > 1) {
    finalOutcome = (divisionCounter * divisionCounter - 1) + (1 << divisionCounter);
  }

  console.log(finalOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
