const processInputAndCalculate = (inputData) => {
  const [valA, valB, valC, valK] = inputData.trim().split(' ').map(Number);

  let currentResult = 0;
  let unitsToProcess = valK;

  const positiveUnitsTaken = Math.min(unitsToProcess, valA);
  currentResult += positiveUnitsTaken;
  unitsToProcess -= positiveUnitsTaken;

  const neutralUnitsTaken = Math.min(unitsToProcess, valB);
  unitsToProcess -= neutralUnitsTaken;

  currentResult -= unitsToProcess;

  console.log(currentResult);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
