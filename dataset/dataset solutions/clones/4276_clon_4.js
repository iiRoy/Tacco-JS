process.stdin.resume();
process.stdin.setEncoding('utf8');

function processInputAndCompute(rawInputText) {
  const inputSegments = rawInputText.split("\n");
  const firstLineElements = inputSegments[0].split(" ");
  const secondLineElements = inputSegments[1].split(" ");

  const totalSteps = Number(firstLineElements[0]);
  const incrementValue = Number(secondLineElements[0]);

  const computedResult = Array.from({ length: totalSteps }).reduce((currentAccumulator, _, stepIndex) => {
    return (currentAccumulator < incrementValue) ? (currentAccumulator * 2) : (currentAccumulator + incrementValue);
  }, 1);

  console.log(computedResult);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
