function processInput(sourceText) {
  const firstLineSegment = sourceText.split('\n')[0];
  const baseCode = firstLineSegment.codePointAt(0);
  console.log(baseCode);

  const nextCode = baseCode + 1;
  const derivedCharacter = String.fromCodePoint(nextCode);

  console.log(derivedCharacter);
  return derivedCharacter;
}

function evaluateTest(testCaseIndex) {
  const testInputElement = document.getElementById("input" + testCaseIndex);
  const testOutputElement = document.getElementById("output" + testCaseIndex);
  const resultDisplayElement = document.getElementById("result" + testCaseIndex);

  const currentInput = testInputElement.value;
  const computedResult = processInput(currentInput);

  const expectedOutput = testOutputElement.value.split("\n")[0];
  let evaluationStatus = "WA";
  if (computedResult === expectedOutput) {
    evaluationStatus = "AC";
  }
  resultDisplayElement.innerHTML = evaluationStatus;
}

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
