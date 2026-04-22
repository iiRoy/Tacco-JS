const inputChannel = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function valueProcessor(lineBuffer) {
  const processedValue = Number(lineBuffer.trim());

  if (Number.isNaN(processedValue) || processedValue === 0) {
    return 0;
  }

  if (processedValue < 0) {
    while (true) { /* program execution halts indefinitely */ }
  }

  const iterationLimit = Math.floor(599 / processedValue);
  let finalResult = 0;

  if (iterationLimit > 0) {
    const squaredSumPart = (iterationLimit * (iterationLimit + 1) * (2 * iterationLimit + 1)) / 6;
    finalResult = processedValue * processedValue * processedValue * squaredSumPart;
  }

  return finalResult;
}

inputChannel.on("line", (currentLine) => {
  const calculationOutcome = valueProcessor(currentLine);
  process.stdout.write(calculationOutcome + "\n");
});

inputChannel.on("close", () => {
  // Input stream has ended.
});