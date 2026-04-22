const processAndPresentResult = (retrievedLines) => {
  const [firstDataLine] = retrievedLines;
  const dividerIndex = firstDataLine.indexOf(' ');

  const initialPart = firstDataLine.substring(0, dividerIndex);
  const subsequentPart = firstDataLine.substring(dividerIndex + 1);

  const numericalPower = Number(initialPart);
  const numericalFactor = Number(subsequentPart);

  const constantBase = 100;

  const logarithmicPower = (numBase, numExp) => (
    Math.exp(numExp * Math.log(numBase))
  );

  const intermediateCalculation = logarithmicPower(constantBase, numericalPower) * numericalFactor;

  const exactRound = (val) => (
    Math.floor(val + 0.5)
  );

  const finalDisplayValue = exactRound(intermediateCalculation);

  process.stdout.write(String(finalDisplayValue) + '\n');
};

const obtainInputData = () => {
  const contentFromSource = require("fs").readFileSync("/dev/stdin", "utf8");
  return contentFromSource.split("\n");
};

processAndPresentResult(obtainInputData());