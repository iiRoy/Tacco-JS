const calculateDigitSummation = (val) => {
  return String(val)
    .split('')
    .reduce((accumulator, character) => accumulator + Number(character), 0);
};

function* createNumberSeries() {
  let priorItem = 0;
  let factorMagnitude = 1;

  while (true) {
    const trialValue = priorItem + factorMagnitude;

    const trialValueSum = calculateDigitSummation(trialValue);
    const nextTrialValueSum = calculateDigitSummation(trialValue + factorMagnitude);

    if (trialValue * nextTrialValueSum <= (trialValue + factorMagnitude) * trialValueSum) {
      yield trialValue;
      priorItem = trialValue;
    } else {
      factorMagnitude *= 10;
    }
  }
}

const executeSequenceGeneration = (inputData) => {
  const requiredCount = Number(inputData);
  const generatedElements = [];
  const seriesIterator = createNumberSeries();

  while (generatedElements.length < requiredCount) {
    generatedElements.push(seriesIterator.next().value);
  }

  return generatedElements.join("\n");
};

const systemEntry = () => {
  const receivedContent = require("fs").readFileSync("/dev/stdin", "utf8");
  const finalOutput = executeSequenceGeneration(receivedContent);
  console.log(finalOutput);
};

systemEntry();