const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");

const inputTokens = inputContent.split(/\s/);

const retrieveBinaryComponents = (sourceValue) => {
  const potentialPowers = Array.from({ length: 10 }, (_, index) => Math.pow(2, index));

  const activeComponents = potentialPowers.filter(
    (currentPower) => (sourceValue & currentPower) !== 0
  );

  return activeComponents.join(' ');
};

inputTokens.forEach(tokenUnit => {
  const processedNumericValue = Number(tokenUnit);
  const outputLine = retrieveBinaryComponents(processedNumericValue);
  console.log(outputLine);
});
