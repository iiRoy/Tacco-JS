function processInput(rawText) {
  const numericValues = rawText.match(/\d+/g).map(Number);
  const factorVal = numericValues[0];
  const limitVal = numericValues[1];

  console.log(factorVal, limitVal);

  if (500 * factorVal > limitVal) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
