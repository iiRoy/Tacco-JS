function assessParityProduct(sourceData) {
  const numberComponents = sourceData.trim().split(' ').map(component => Number(component));
  const primaryValue = numberComponents[0];
  const secondaryValue = numberComponents[1];

  const isPrimaryOdd = (primaryValue & 1) === 1;
  const isSecondaryOdd = (secondaryValue & 1) === 1;

  const outcomeText = (isPrimaryOdd && isSecondaryOdd) ? "Yes" : "No";
  return outcomeText;
}

const streamContent = require("fs").readFileSync("/dev/stdin", "utf8");
process.stdout.write(assessParityProduct(streamContent) + '\n');