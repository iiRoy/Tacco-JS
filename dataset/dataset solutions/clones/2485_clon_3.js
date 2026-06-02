function getStdinContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function processInputData(rawInputString) {
  const numericParts = rawInputString.split(' ');

  const valA = Number(numericParts[0]);
  const valB = Number(numericParts[1]);

  const MULTIPLIER_FACTOR = 2;

  const productB = valB * MULTIPLIER_FACTOR;

  const initialDifference = valA - productB;

  const finalResult = Math.max(0, initialDifference);

  console.log(finalResult);
}

processInputData(getStdinContent());
