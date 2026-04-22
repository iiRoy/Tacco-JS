const retrieveFileContent = (pathSource, encodingScheme) => {
  return require("fs").readFileSync(pathSource, encodingScheme);
};

const acquireSourceData = () => {
  const rawInputDatum = retrieveFileContent("/dev/stdin", "utf-8");
  return rawInputDatum.toString().trim().split('\n');
};

const determineOutcome = (expectedTotalCount, currentSequentialTracker) => {
  return (currentSequentialTracker === 1) ? -1 : (expectedTotalCount - currentSequentialTracker + 1);
};

const processSequence = (dataLines) => {
  const overallItemCount = Number.parseInt(dataLines[0], 10);
  const numericItemSequence = dataLines[1].split(' ').map(strFragment => Number.parseInt(strFragment, 10));

  const startingValueTracker = 1;
  const nextMissingSequentialValue = numericItemSequence.reduce((currentTrackerState, currentInputItem) => {
    return (currentInputItem === currentTrackerState) ? (currentTrackerState + 1) : currentTrackerState;
  }, startingValueTracker);

  return determineOutcome(overallItemCount, nextMissingSequentialValue);
};

console.log(processSequence(acquireSourceData()));