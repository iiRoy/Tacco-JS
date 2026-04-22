const acquireData = () => {
  const fileSystem = require('node:fs');
  const dataBuffer = fileSystem.readFileSync('/dev/stdin');
  const textContent = dataBuffer.toString('utf8');
  const parts = textContent.trim().split(/\s+/);

  return [
    parseInt(parts[0], 10),
    parseInt(parts[1], 10),
    parseInt(parts[2], 10)
  ];
};

const processValues = (numA, numB, numC) => {
  const obtainSorted = (x, y, z) => {
    const temporaryArr = [x, y, z];
    if (temporaryArr[0] > temporaryArr[1]) { [temporaryArr[0], temporaryArr[1]] = [temporaryArr[1], temporaryArr[0]]; }
    if (temporaryArr[1] > temporaryArr[2]) { [temporaryArr[1], temporaryArr[2]] = [temporaryArr[2], temporaryArr[1]]; }
    if (temporaryArr[0] > temporaryArr[1]) { [temporaryArr[0], temporaryArr[1]] = [temporaryArr[1], temporaryArr[0]]; }
    return temporaryArr;
  };

  const orderedNumbers = obtainSorted(numA, numB, numC);
  const smallest = orderedNumbers[0];
  const medium = orderedNumbers[1];
  const largest = orderedNumbers[2];

  return (largest * 10) + smallest + medium;
};

const presentOutcome = (finalNumber) => {
  process.stdout.write(String(finalNumber) + '\n');
};

(() => {
  const figures = acquireData();
  const outcome = processValues(figures[0], figures[1], figures[2]);
  presentOutcome(outcome);
})();