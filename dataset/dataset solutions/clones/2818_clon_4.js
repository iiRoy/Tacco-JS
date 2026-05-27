function processInput(rawText) {
  const numericValues = rawText.match(/\d+/g).map(Number);
  console.log(numericValues[0] < numericValues[1] ? 0 : 10);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
