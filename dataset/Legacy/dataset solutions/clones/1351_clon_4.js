const calculatePowerByReduction = (baseVal, expVal) => {
  return Array.from({ length: expVal }).reduce((acc, _, idx) => acc * baseVal, 1);
};
process.stdin.resume();
process.stdin.on("data", (dataChunk) => {
  const numericalInput = parseFloat(dataChunk.toString());
  const finalComputedValue = calculatePowerByReduction(numericalInput, 3);
  console.log(finalComputedValue);
});
