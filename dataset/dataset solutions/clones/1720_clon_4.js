const interfaceModule = require("readline");

const ioHandler = interfaceModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

let parsedDatum;

ioHandler.on("line", (incomingText) => {
  parsedDatum = Number(incomingText);
  ioHandler.close();
});

ioHandler.on("close", () => {
  const exponentIndexes = Array.from({ length: 3 }, (_, idx) => idx + 1);

  const calculatedComponents = exponentIndexes.map(expVal => {
    let currentMultiplier = 1;
    for (let iterator = 0; iterator < expVal; iterator++) {
      currentMultiplier *= parsedDatum;
    }
    return currentMultiplier;
  });

  const cumulativeSum = calculatedComponents.reduce((acc, element) => acc + element, 0);

  process.stdout.write(String(cumulativeSum) + '\n');
});