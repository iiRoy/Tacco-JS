const MIN_YEAR_FOR_TBD_DIRECT = 2020;
const MIN_YEAR_FOR_TBD_CONDITIONAL = 2019;
const MIN_MONTH_FOR_TBD_CONDITIONAL = 5;
const DEFAULT_ERA_HEISEI = "Heisei";
const TBD_ERA_IDENTIFIER = "TBD";

function extractDateComponents(dateString) {
  const dateParts = dateString.split("/");
  const yearValue = parseInt(dateParts[0], 10);
  const monthValue = parseInt(dateParts[1], 10);
  return { year: yearValue, month: monthValue };
}

function resolveEraStatus(currentYear, currentMonth) {
  let eraResult = DEFAULT_ERA_HEISEI;

  const isYearTwoThousandTwentyOrLater = currentYear >= MIN_YEAR_FOR_TBD_DIRECT;
  const isYearTwoThousandNineteenAndMonthMayOrLater = currentYear >= MIN_YEAR_FOR_TBD_CONDITIONAL && currentMonth >= MIN_MONTH_FOR_TBD_CONDITIONAL;

  if (isYearTwoThousandTwentyOrLater || isYearTwoThousandNineteenAndMonthMayOrLater) {
    eraResult = TBD_ERA_IDENTIFIER;
  }
  return eraResult;
}

function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const targetDateString = inputLines[0];

  const { year: currentYear, month: currentMonth } = extractDateComponents(targetDateString);

  const eraName = resolveEraStatus(currentYear, currentMonth);

  console.log('%s', eraName);
  return eraName;
}

function executeDebugScenario(scenarioIndex){
  const inputElementId = "input" + scenarioIndex;
  const rawInputData = document.getElementById(inputElementId).value;
  processInputData(rawInputData);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
