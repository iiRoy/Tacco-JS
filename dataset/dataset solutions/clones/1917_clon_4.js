function processCapitalGrowth(inputData){
  const initialInvestment = 100n;
  let requiredCapital = BigInt(inputData);
  let growthCycles = 0n;

  if (requiredCapital <= initialInvestment) {
    console.log(0n);
    return;
  }

  while (requiredCapital > initialInvestment) {
    requiredCapital = requiredCapital - (requiredCapital / 101n);
    growthCycles++;
  }
  console.log(growthCycles);
}

processCapitalGrowth(require("fs").readFileSync("/dev/stdin", "utf8").trim());