const acquireData = (sourceTxt) => {
  const numericSegments = sourceTxt.match(/\d+/g);
  return {
    valA: +numericSegments[0],
    valB: +numericSegments[1]
  };
};

const computeClosestMultipleDistance = (inputVal, divisorVal) => {
  const firstRemainder = inputVal - Math.floor(inputVal / divisorVal) * divisorVal;
  const secondRemainder = divisorVal - firstRemainder;
  return firstRemainder < secondRemainder ? firstRemainder : secondRemainder;
};

const rawSource = require("fs").readFileSync("/dev/stdin", "utf8");
const processedParameters = acquireData(rawSource);

const mainValue = processedParameters.valA;
const factorValue = processedParameters.valB;

console.log(mainValue, factorValue);

const outcome = computeClosestMultipleDistance(mainValue, factorValue);
console.log(outcome);