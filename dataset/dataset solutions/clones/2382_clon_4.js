function processInput(rawInput) {
  const inputLines = rawInput.split("\n");

  const [tFactor1Str, tFactor2Str] = inputLines[0].split(" ");
  const [alphaVal1Str, alphaVal2Str] = inputLines[1].split(" ");
  const [betaVal1Str, betaVal2Str] = inputLines[2].split(" ");

  const tFactor1 = parseFloat(tFactor1Str);
  const tFactor2 = parseFloat(tFactor2Str);
  const alphaVal1 = parseFloat(alphaVal1Str);
  const alphaVal2 = parseFloat(alphaVal2Str);
  const betaVal1 = parseFloat(betaVal1Str);
  const betaVal2 = parseFloat(betaVal2Str);

  const firstCalc = tFactor1 * (alphaVal1 - betaVal1);
  const secondCalc = tFactor2 * (alphaVal2 - betaVal2) + firstCalc;

  const finalOutcome =
    (Math.sign(firstCalc) === Math.sign(secondCalc))
      ? 0
      : (secondCalc === 0)
        ? "infinity"
        : (() => {
            const absFirst = Math.abs(firstCalc);
            const absSecond = Math.abs(secondCalc);
            const integerQuotient = Math.floor(absFirst / absSecond);
            const hasRemainder = absFirst % absSecond !== 0;
            return (integerQuotient * 2) + (hasRemainder ? 1 : 0);
          })();

  console.log(finalOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
