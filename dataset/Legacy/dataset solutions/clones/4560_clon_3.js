const CATEGORY_TYPE_A_VAL = null;
const CATEGORY_TYPE_B_VAL = null;
const CATEGORY_TYPE_C_VAL = null;

const MONTHS_WITH_31_DAYS = new Set([1, 3, 5, 7, 8, 10, 12]);
const MONTHS_WITH_30_DAYS = new Set([4, 6, 9, 11]);

function retrieveMonthClassification(monthNumber) {
  if (MONTHS_WITH_31_DAYS.has(monthNumber)) {
    return CATEGORY_TYPE_A_VAL;
  } else if (MONTHS_WITH_30_DAYS.has(monthNumber)) {
    return CATEGORY_TYPE_B_VAL;
  } else {
    return CATEGORY_TYPE_C_VAL;
  }
}

function processInputData(rawInputString) {
  const cleanedInput = rawInputString.trim();
  const inputTokens = cleanedInput.split(" ");

  const firstParsedMonth = parseInt(inputTokens[0], 10);
  const secondParsedMonth = parseInt(inputTokens[1], 10);

  const classificationForFirst = retrieveMonthClassification(firstParsedMonth);
  const classificationForSecond = retrieveMonthClassification(secondParsedMonth);

  if (classificationForFirst === classificationForSecond) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
