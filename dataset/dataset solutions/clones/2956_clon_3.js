const TYPE_NA_CODE = "2";
const TYPE_MONTH_CODE = "1";
const TYPE_YEAR_CODE = "0";

const RESULT_NOT_APPLICABLE = "NA";
const RESULT_MONTH_YEAR = "MMYY";
const RESULT_AMBIGUOUS_FORMAT = "AMBIGUOUS";
const RESULT_YEAR_MONTH = "YYMM";

function processInputData(rawInputString) {
  const firstTwoChars = rawInputString.substring(0, 2);
  const lastTwoChars = rawInputString.substring(2, 4);

  const firstSegmentInterpretation = interpretNumericPair(Number(firstTwoChars));
  const secondSegmentInterpretation = interpretNumericPair(Number(lastTwoChars));

  let finalOutputMessage;

  const isInvalidScenario = (
    firstSegmentInterpretation === TYPE_NA_CODE ||
    secondSegmentInterpretation === TYPE_NA_CODE ||
    (firstSegmentInterpretation === TYPE_YEAR_CODE && secondSegmentInterpretation === TYPE_YEAR_CODE)
  );

  if (isInvalidScenario) {
    finalOutputMessage = RESULT_NOT_APPLICABLE;
  } else if (firstSegmentInterpretation === TYPE_MONTH_CODE) {
    if (secondSegmentInterpretation === TYPE_YEAR_CODE) {
      finalOutputMessage = RESULT_MONTH_YEAR;
    } else {
      finalOutputMessage = RESULT_AMBIGUOUS_FORMAT;
    }
  } else { // firstSegmentInterpretation must be TYPE_YEAR_CODE here
    if (secondSegmentInterpretation === TYPE_MONTH_CODE) {
      finalOutputMessage = RESULT_YEAR_MONTH;
    } else {
      // This path should ideally be covered by isInvalidScenario, but for robustness
      // and to match original logic's implicit NA for such cases.
      finalOutputMessage = RESULT_NOT_APPLICABLE;
    }
  }

  console.log(finalOutputMessage);
}

function interpretNumericPair(numericValue) {
  if (numericValue === 0) {
    return TYPE_NA_CODE;
  } else if (numericValue >= 1 && numericValue <= 12) {
    return TYPE_MONTH_CODE;
  } else {
    return TYPE_YEAR_CODE;
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
