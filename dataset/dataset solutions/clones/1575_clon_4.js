function performCalculation(sourceData) {
  const numericalRepresentation = BigInt(sourceData);
  const moduloResult = numericalRepresentation % 9n;

  const affirmativeResponse = "Yes";
  const negativeResponse = "No";

  if (moduloResult === 0n) {
    console.log(affirmativeResponse);
  } else {
    console.log(negativeResponse);
  }
}
performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));