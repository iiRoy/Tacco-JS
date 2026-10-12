function readStandardInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function calculateYearsToReachTarget(inputLines) {
  const targetAmountString = inputLines[0];
  const targetAmountValue = parseInt(targetAmountString, 10);

  const initialInvestment = 100;
  const annualInterestRateFactor = 1.01;

  let currentCapital = initialInvestment;
  let yearsElapsed = 0;

  while (currentCapital < targetAmountValue) {
    let nextYearlyCapital = currentCapital * annualInterestRateFactor;
    currentCapital = Math.floor(nextYearlyCapital);
    yearsElapsed++;
  }

  console.log(yearsElapsed);
}

const programInputData = readStandardInput();
calculateYearsToReachTarget(programInputData);
