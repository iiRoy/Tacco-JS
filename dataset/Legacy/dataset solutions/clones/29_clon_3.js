const fileContent = require("fs").readFileSync("/dev/stdin","utf8");
let initialLoanAmount = 100000;
const nominalInterestRate = 5;

processLoanProjection(initialLoanAmount, undefined, nominalInterestRate);

function processLoanProjection(currentLoanValue, periodCount, rateValue){
  const INTEREST_MULTIPLIER = 1.05;
  const THOUSAND_UNIT = 1000;
  const NUMBER_OF_CYCLES = 5;

  for (let loopIndex = 0; loopIndex < NUMBER_OF_CYCLES; loopIndex++) {
    let intermediateValue = currentLoanValue * INTEREST_MULTIPLIER;
    currentLoanValue = Math.ceil(intermediateValue / THOUSAND_UNIT) * THOUSAND_UNIT;
  }
  
  console.log(currentLoanValue);
}
