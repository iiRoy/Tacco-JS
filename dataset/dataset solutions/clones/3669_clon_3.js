function getInputData(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(res){
  console.log(res);
}

function transformInput(valueToConvert, conversionType){
  let processedValue;
  switch(conversionType){
    case 0:
      processedValue = valueToConvert;
      break;
    case 1:
      processedValue = parseInt(valueToConvert);
      break;
    case 2:
      processedValue = valueToConvert.split(" ");
      break;
    case 3:
      processedValue = valueToConvert.split("\n");
      break;
    case 4:
      const partsForNumbers = valueToConvert.split(" ");
      processedValue = partsForNumbers.map((val) => Number(val));
      break;
    case 5:
      const linesForNumbers = valueToConvert.split("\n");
      processedValue = linesForNumbers.map((val) => Number(val));
      break;
    case 6:
      processedValue = valueToConvert.split("");
      break;
    case 7:
      const charsForNumbers = valueToConvert.split("");
      processedValue = charsForNumbers.map((val) => Number(val));
      break;
    default:
      processedValue = valueToConvert;
  }
  return processedValue;
}

function checkPurchaseFeasibility(initialStock, purchaseAmount, threshold, replenishmentAmount) {
  let currentStockLevel = initialStock;
  let currentSimulationStep = 0;
  const MAX_ITERATIONS_THRESHOLD = 10000000;

  while (true) {
    currentSimulationStep++;

    if (currentStockLevel < purchaseAmount) {
      return false;
    }

    currentStockLevel %= purchaseAmount;

    if (currentStockLevel <= threshold) {
      currentStockLevel += replenishmentAmount;
    }

    const hasCycleOccurred = currentStockLevel === initialStock;
    const hasMaxStepsBeenReached = currentSimulationStep >= MAX_ITERATIONS_THRESHOLD;

    if (hasCycleOccurred || hasMaxStepsBeenReached) {
      return true;
    }
  }
}

function processSimulation(rawData) {
  const allInputLines = transformInput(rawData, 3);
  const [_, ...individualCases] = allInputLines;

  const simulationOutcomes = [];

  for (const caseLine of individualCases) {
    const caseParameters = transformInput(caseLine, 4);
    const initialStockValue = caseParameters[0];
    const purchaseQuantity = caseParameters[1];
    const replenishmentThreshold = caseParameters[2];
    const dailyReplenishment = caseParameters[3];

    const canSustain = checkPurchaseFeasibility(
      initialStockValue,
      purchaseQuantity,
      replenishmentThreshold,
      dailyReplenishment
    );

    simulationOutcomes.push(canSustain ? "Yes" : "No");
  }

  displayResult(simulationOutcomes.join("\n"));
}

processSimulation(getInputData());
