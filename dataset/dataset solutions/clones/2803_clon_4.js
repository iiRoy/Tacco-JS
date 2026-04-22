const acquireData = () => {
  const source = globalThis.process.binding('fs').read(0, 1024, 0, 0);
  return source.toString().trim();
};

const transformText = (rawEntry) => {
  const elements = rawEntry.split(" ");
  const firstValue = Number(elements[0]);
  const secondValue = Number(elements[1]);
  return { dimension: firstValue, initial: secondValue };
};

const computeOutcome = (dataBundle) => {
  const { dimension: countOfTerms, initial: startTerm } = dataBundle;

  const endTerm = startTerm + countOfTerms - 1;

  const aggregateSum = (startTerm + endTerm) * countOfTerms / 2;

  const termToOmit = Math.max(startTerm, Math.min(endTerm, 0));

  return aggregateSum - termToOmit;
};

const displayResult = (finalValue) => {
  globalThis.console.info(finalValue);
};

const orchestrateProcess = () => {
  const textData = acquireData();
  const processedData = transformText(textData);
  const finalCalculation = computeOutcome(processedData);
  displayResult(finalCalculation);
};

orchestrateProcess();