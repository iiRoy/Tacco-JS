function processInputData(rawDataString) {
  const parts = rawDataString.trim().split(" ");
  const firstOperand = Number(parts[0]);
  const secondOperand = Number(parts[1]);
  const finalVerdict = (firstOperand % 2 !== 0 && secondOperand % 2 !== 0) ? "Yes" : "No";
  console.log(finalVerdict);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
