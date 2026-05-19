const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const numericValue = Number(sourceData);

const piConstant = Math.PI;
const twoPiConstant = 2 * piConstant;

const areaResult = Math.pow(numericValue, 2) * piConstant;
const circumferenceResult = numericValue * twoPiConstant;

const formattedOutput = [areaResult, circumferenceResult].map(
  (val) => val.toFixed(6)
);

console.log(formattedOutput.join(' '));
