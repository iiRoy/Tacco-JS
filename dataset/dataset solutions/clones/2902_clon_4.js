const acquireNumericElements = (textualData, delimiterRegex) => {
  const segments = textualData.trim().split(delimiterRegex);
  if (segments.length !== 2) {
    throw new Error("Input string malformed; expected two numeric components.");
  }
  return segments.map(Number);
};

const calculateCompositeValue = (initialOperand, secondaryOperand) => {
  const transformFirst = (val) => val * 3;
  const combineOperands = (val1, val2) => val1 + val2;
  const halveResult = (val) => val / 2;
  const extractIntegerPart = (val) => Math.trunc(val);

  const intermediateResult = combineOperands(transformFirst(initialOperand), secondaryOperand);
  return extractIntegerPart(halveResult(intermediateResult));
};

const orchestrateExecution = (sourceIdentifier) => {
  const rawInputContent = require("node:fs").readFileSync(sourceIdentifier, "utf8");

  const [firstComponent, secondComponent] = acquireNumericElements(rawInputContent, /\s+/);

  const computedOutcome = calculateCompositeValue(firstComponent, secondComponent);

  console.info(computedOutcome);
};

orchestrateExecution("/dev/stdin");