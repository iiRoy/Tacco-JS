const transformBinarySequence = (symbolStream) => {
  const numericalStream = Array.from(symbolStream).map(Number);
  const streamExtent = numericalStream.length;

  const deviationFromAlternatingZero = numericalStream.reduce((currentDeviation, digitValue, positionIndex) => {
    const expectedForZeroStart = positionIndex % 2;
    return currentDeviation + (digitValue !== expectedForZeroStart ? 1 : 0);
  }, 0);

  const deviationFromAlternatingOne = numericalStream.reduce((currentDeviation, digitValue, positionIndex) => {
    const expectedForOneStart = (positionIndex + 1) % 2;
    return currentDeviation + (digitValue !== expectedForOneStart ? 1 : 0);
  }, 0);

  return Math.min(deviationFromAlternatingZero, deviationFromAlternatingOne);
};

const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(transformBinarySequence(acquiredData.trim()));