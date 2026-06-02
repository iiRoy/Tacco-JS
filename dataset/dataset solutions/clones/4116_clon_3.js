function processInputData(rawInputString) {
  const trimmedInput = rawInputString.trim();
  const parsedNumericValue = Number(trimmedInput);

  const baseConstant = 24;
  const differenceFromBase = baseConstant - parsedNumericValue;
  const finalComputedValue = baseConstant + differenceFromBase;

  console.log(finalComputedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
