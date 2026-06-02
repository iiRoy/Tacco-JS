function processChallenge(rawData) {
  const lineContent = rawData.split("\n")[0];
  const numericParts = lineContent.match(/(\d+)\s+(\d+)/);
  
  const firstQuantity = parseInt(numericParts[1], 10);
  const secondQuantity = parseInt(numericParts[2], 10);

  const powerTerm = Math.pow(2, secondQuantity);
  const baseCoefficient = 18;
  const scalingFactor = 100;

  const intermediateSum = (baseCoefficient * secondQuantity) + firstQuantity;
  const scaledSum = scalingFactor * intermediateSum;
  
  const finalResult = powerTerm * scaledSum;

  console.log(finalResult);
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
