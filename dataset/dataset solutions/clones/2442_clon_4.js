const processInput = (rawText) => {
  const numericValue = parseInt(rawText.trim(), 10);
  const calculatedResult = Math.round(numericValue / 2) - 1;
  console.log(calculatedResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
