const calculatePower = (baseValue, exponentValue) => {
  return Math.pow(baseValue, exponentValue);
};

process.stdin.resume();

const CUBE_EXPONENT = 3;

process.stdin.on("data", (inputBuffer) => {
  const numericInput = Number(inputBuffer);
  const finalResult = calculatePower(numericInput, CUBE_EXPONENT);
  console.log(finalResult);
});
