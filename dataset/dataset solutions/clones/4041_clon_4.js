function processInputSource(inputDataString) {
  const lineSeries = inputDataString.split('\n');
  const entityQuantum = Number(lineSeries[0]);

  const primarySequence = lineSeries[1].split(' ').map(Number);
  const secondarySequence = lineSeries[2].split(' ').map(Number);

  const aggregateEvaluation = primarySequence.reduce((accumulator, primaryValue, index) => {
    const secondaryValue = secondarySequence[index];
    accumulator.totalDifference += (secondaryValue - primaryValue); // Corresponds to sumb - suma
    accumulator.downwardOffsetSum += Math.max(0, primaryValue - secondaryValue); // Corresponds to difm
    return accumulator;
  }, { totalDifference: 0, downwardOffsetSum: 0 });

  let conclusion = "No";

  // The original complex conditions simplify to:
  // (sumb - suma > 0) && (sumb - suma == difm)
  // This is because the original's 'difp / difm <= 2' evaluates to false if difm is 0 (due to 0/0 being NaN in JS).
  // If difm > 0, then the conditions (difm <= D) and (D <= difm) and (D >= 0) and (difp <= 2*D) and (difp <= 2*difm)
  // collectively simplify to D == difm.
  // If difm == 0, then D must be 0 for D == difm. If D == 0 and difm == 0, then difp == 0.
  // In this case (D=0, difm=0, difp=0), the original condition 0/0 <= 2 is false.
  // So the condition (D == difm) only leads to "Yes" if D (and thus difm) is strictly greater than 0.
  if (aggregateEvaluation.totalDifference > 0 && aggregateEvaluation.totalDifference === aggregateEvaluation.downwardOffsetSum) {
    conclusion = "Yes";
  }

  console.log(String(conclusion));
}

processInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));