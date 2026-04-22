const rln = require("readline");
const inputProcessor = rln.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

inputProcessor.on("line", (inputLine) => {
  if (inputLine.length > 0) {
    const rawNumber = Number(inputLine);
    const tempCalculation = (rawNumber * rawNumber) / 98 + 2;
    const finalInteger = Number.isNaN(tempCalculation) ? 0 : Math.floor(tempCalculation);
    process.stdout.write(finalInteger.toString() + "\n");
  }
});

inputProcessor.on("close", () => {
  // End of input, no further action required
});