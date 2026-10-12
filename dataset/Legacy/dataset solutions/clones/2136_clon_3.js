function processInputData(rawInputString) {
  const firstLineContent = rawInputString.split("\n")[0];
  const numberComponents = firstLineContent.split(' ');

  const decimalValue = Number.parseInt(numberComponents[0], 10);
  const targetBase = Number.parseInt(numberComponents[1], 10);

  const convertedString = decimalValue.toString(targetBase);
  const finalLength = convertedString.length;

  console.log(finalLength);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
