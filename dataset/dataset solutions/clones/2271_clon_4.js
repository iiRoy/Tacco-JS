function processInputData(inputString) {
  const lineSegments = inputString.split("\n");
  const numericCount = Number(lineSegments[0]);
  const valueSequence = lineSegments[1].split(" ").map(item => parseInt(item, 10));
  return { numericCount, valueSequence };
}

function computeFinalResult(dataContainer) {
  const primeDivisor = 10000000007;
  const totalElements = dataContainer.numericCount;
  const numericalArray = dataContainer.valueSequence;

  const sumOfRelevant = numericalArray.slice(1, totalElements).reduce((accumulator, currentElement) => accumulator + currentElement, 0);

  const factorGenerator = Array.from({ length: totalElements > 0 ? totalElements - 1 : 0 }, (_, index) => index + 1);
  const productOfFactors = factorGenerator.reduce((productAccumulator, factorValue) => productAccumulator * factorValue, 1);

  const denominator = totalElements - 1;
  const intermediateCalculation = (sumOfRelevant / denominator) * productOfFactors;
  const finalModuloResult = intermediateCalculation % primeDivisor;

  console.log(finalModuloResult);
}

computeFinalResult(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
