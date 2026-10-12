function readInputSource() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printResult(outputContent) {
  console.log(outputContent);
}

const inputTransformers = {
  0: (val) => val,
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  3: (val) => val.split("\n"),
  4: (val) => val.split(" ").map((item) => Number(item)),
  5: (val) => val.split("\n").map((item) => Number(item)),
  6: (val) => val.split(""),
  7: (val) => val.split("").map((item) => Number(item)),
};

function applyInputConversion(inputData, conversionKey) {
  const transformer = inputTransformers[conversionKey];
  if (transformer) {
    return transformer(inputData);
  }
  return inputData;
}

const SALES_TAX_RATE = 1.08;

function calculateValueWithTax(baseValue, taxRate) {
  return baseValue * taxRate;
}

function calculateBaseValue(taxedValue, taxRate) {
  return taxedValue / taxRate;
}

function executeMainLogic(rawInputString) {
  const processedInputVal = applyInputConversion(rawInputString, 1);

  const exactBasePriceCandidate = calculateBaseValue(processedInputVal, SALES_TAX_RATE);

  const floorTaxedAmount = Math.floor(calculateValueWithTax(exactBasePriceCandidate, SALES_TAX_RATE));
  const ceilTaxedAmount = Math.ceil(calculateValueWithTax(exactBasePriceCandidate, SALES_TAX_RATE));

  let finalOutput;

  if (processedInputVal === floorTaxedAmount) {
    finalOutput = Math.ceil(exactBasePriceCandidate);
  } else if (processedInputVal === ceilTaxedAmount) {
    finalOutput = Math.floor(exactBasePriceCandidate);
  } else {
    finalOutput = ":(";
  }

  printResult(finalOutput);
}

executeMainLogic(readInputSource());
