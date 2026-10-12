function processInputData(sourceText) {
  const [firstVal, secondVal] = sourceText.match(/\d+/g).map(Number);

  const outcome = firstVal / 3;

  console.log(outcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
