const acquireCriterion = (sourceBlob) => {
  const firstSegment = sourceBlob.substring(0, sourceBlob.indexOf('\n'));
  const numericString = firstSegment.split(' ')[0];
  return parseInt(numericString, 10);
};

function* produceNumberedSeries() {
  let currentPosition = 1;
  let cumulativeSum = 0;
  for (;;) {
    cumulativeSum += currentPosition;
    yield { ordinal: currentPosition, value: cumulativeSum };
    currentPosition++;
  }
}

const identifyMatch = (inputData) => {
  const requiredDivisor = acquireCriterion(inputData);
  const sequenceGenerator = produceNumberedSeries();
  let foundElement;

  while (true) {
    const { ordinal, value } = sequenceGenerator.next().value;
    if (value % requiredDivisor === 0) {
      foundElement = ordinal;
      break;
    }
  }
  return foundElement;
};

const initiateProcess = (rawTextContent) => {
  const finalOutcome = identifyMatch(rawTextContent);
  process.stdout.write(String(finalOutcome));
};

initiateProcess(require("fs").readFileSync("/dev/stdin", "utf8"));