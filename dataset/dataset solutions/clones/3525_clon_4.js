const inputData = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputData.push(currentLine.split(" "));
});

inputReader.on('close', () => {
  const warOutcome = determineConflict(inputData);
  process.stdout.write(warOutcome ? "War\n" : "No War\n");
});

function determineConflict(rawInput) {
  const [firstLine, empireADesired, empireBDesired] = rawInput;

  const currentX = Number(firstLine[2]);
  const currentY = Number(firstLine[3]);

  const empireAExtremes = empireADesired.map(Number);
  const empireBExtremes = empireBDesired.map(Number);

  const highestA = empireAExtremes.reduce((acc, val) => Math.max(acc, val), -Infinity);
  const lowestB = empireBExtremes.reduce((acc, val) => Math.min(acc, val), Infinity);

  const conflictThreshold = Math.max(currentX, highestA);
  const peaceThreshold = Math.min(currentY, lowestB);

  return conflictThreshold >= peaceThreshold;
}
