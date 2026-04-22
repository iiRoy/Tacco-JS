function processPayload(payload) {
  const componentValues = payload.split(' ').map(Number);

  const firstTerm = componentValues[0];
  const secondTerm = componentValues[1];

  const oddFlagA = (firstTerm % 2 !== 0);
  const oddFlagB = (secondTerm % 2 !== 0);

  const productIsOdd = oddFlagA && oddFlagB;

  const resultMapping = ["Even", "Odd"];

  const finalResult = resultMapping[Number(productIsOdd)];

  console.log(finalResult);
}

processPayload(require("fs").readFileSync("/dev/stdin", "utf8"));