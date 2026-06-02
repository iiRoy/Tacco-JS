const solveProblem = (rawInput) => {
    const lines = rawInput.split('\n');

    const [dimA, dimB] = lines[0].split(' ').map(Number);

    const sequenceA = lines[1].split(' ').map(Number);
    const sequenceB = lines[2].split(' ').map(Number);

    const primeModulus = 10**9 + 7;

    const initialGrid = [Array(dimB + 1).fill(0)];

    const computedGrid = Array.from({ length: dimA }, (_, sIndex) => sIndex).reduce((accumulatorGrid, currentSIndex) => {
        const priorRow = accumulatorGrid[currentSIndex];
        const activeRow = Array(dimB + 1).fill(0);

        Array.from({ length: dimB }, (_, tIndex) => tIndex).forEach((currentTIndex) => {
            const elementS = sequenceA[currentSIndex];
            const elementT = sequenceB[currentTIndex];

            if (elementS === elementT) {
                activeRow[currentTIndex + 1] = (priorRow[currentTIndex + 1] + activeRow[currentTIndex] + 1) % primeModulus;
            } else {
                activeRow[currentTIndex + 1] = (priorRow[currentTIndex + 1] + activeRow[currentTIndex] + (primeModulus - priorRow[currentTIndex])) % primeModulus;
            }
        });

        accumulatorGrid.push(activeRow);
        return accumulatorGrid;
    }, initialGrid);

    const finalCount = computedGrid[dimA][dimB] + 1;

    console.log('%s', finalCount);
    return finalCount;
};

const testSolution = (caseNum) => {
  const inputElement = document.getElementById("input" + caseNum);
  const outputElement = document.getElementById("output" + caseNum);
  const resultElement = document.getElementById("result" + caseNum);

  if (!inputElement || !outputElement || !resultElement) {
      console.error(`Elements for case ${caseNum} not found.`);
      return;
  }

  const currentInput = inputElement.value;
  const computedAnswer = solveProblem(currentInput);
  const expectedOutput = outputElement.value.split("\n")[0];

  let testResult = "WA";
  if (String(computedAnswer) === expectedOutput) {
    testResult = "AC";
  }
  resultElement.innerHTML = testResult;
};

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
