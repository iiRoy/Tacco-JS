const acquirePayload = () => require("node:fs").readFileSync(0, "utf8").trim();
const dispatchResult = (payload) => process.stdout.write(`${payload}\n`);
const signalMalfunction = (payload) => process.stderr.write(`${payload}\n`);

const processInputMatrix = (rawInputContent) =>
  rawInputContent.split("\n").map(Number);

const initialMatrix = processInputMatrix(acquirePayload());
const dataLength = initialMatrix[0];
const sequenceElements = initialMatrix.slice(1);
sequenceElements.push(0);

if (sequenceElements[0] !== 0) {
  dispatchResult(-1);
  process.exit(0);
}

let totalAggregate = 0;

for (let currentIdx = dataLength - 1; currentIdx >= 1; --currentIdx) {
  const precedingValue = sequenceElements[currentIdx];
  const succeedingValue = sequenceElements[currentIdx + 1];

  if (succeedingValue - precedingValue > 1) {
    dispatchResult(-1);
    process.exit(0);
  }

  if (precedingValue >= succeedingValue) {
    const operationStart = currentIdx - (precedingValue - 1);
    const operationEnd = currentIdx + 1;

    if (operationEnd < dataLength) {
      totalAggregate -= (dataLength - operationEnd);
    }
    if (operationStart < dataLength) {
      totalAggregate += (dataLength - operationStart);
    }
  }
}

dispatchResult(totalAggregate);