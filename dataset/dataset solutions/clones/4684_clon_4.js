function ComputeSequenceLimit(rawText) {
  const targetSumValue = Number.parseInt(rawText);

  if (Number.isNaN(targetSumValue) || targetSumValue <= 0) {
    console.log('%s', 0);
    return;
  }

  const termUnderSquareRoot = 1 + 8 * targetSumValue;
  const squareRootResult = Math.sqrt(termUnderSquareRoot);
  const intermediateCalculation = (-1 + squareRootResult) / 2;
  const finalOutcome = Math.ceil(intermediateCalculation);

  console.log('%s', finalOutcome);
}

function performTest() {
  const webInput = document.getElementById("entryField").value;
  ComputeSequenceLimit(webInput);
}

ComputeSequenceLimit(require("fs").readFileSync("/dev/stdin", "utf8"));