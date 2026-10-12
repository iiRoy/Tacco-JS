function Main(inputString) {
  const inputLines = inputString.split("\n");
  const [factorR, offsetD, initialX] = inputLines[0].split(" ").map(Number);

  function* sequenceGenerator(startValue, multiplier, subtractor) {
    let currentCalculatedValue = startValue * multiplier - subtractor;
    yield currentCalculatedValue;
    for (let iterationCount = 0; iterationCount < 9; iterationCount++) {
      currentCalculatedValue = currentCalculatedValue * multiplier - subtractor;
      yield currentCalculatedValue;
    }
  }

  const generatedSequence = Array.from(sequenceGenerator(initialX, factorR, offsetD));
  const formattedOutput = generatedSequence.join("\n");

  console.log('%s', formattedOutput);
  return formattedOutput;
}

function testFunction(testCaseIdentifier) {
  const testInputContent = document.getElementById("input" + testCaseIdentifier).value;
  const functionResult = Main(testInputContent);
  let comparisonStatus = "WA";
  if (functionResult === document.getElementById("output" + testCaseIdentifier).value.split("\n")[0]) {
    comparisonStatus = "AC";
  }
  document.getElementById("result" + testCaseIdentifier).innerHTML = comparisonStatus;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
