function evaluateMonthStatus(numericSegment) {
  if (numericSegment === 0) {
    return "INVALID_SEGMENT";
  } else if (numericSegment >= 1 && numericSegment <= 12) {
    return "POSSIBLE_MONTH";
  } else {
    return "NOT_MONTH";
  }
}

function analyzeDatePattern(initialString) {
  const characterArray = initialString.split("");

  const firstTwoDigits = characterArray[0] + characterArray[1];
  const lastTwoDigits = characterArray[2] + characterArray[3];

  const firstStatus = evaluateMonthStatus(Number(firstTwoDigits));
  const secondStatus = evaluateMonthStatus(Number(lastTwoDigits));

  let patternClassification;

  /*
   * This section determines the date format based on segment validity:
   * - "INVALID_SEGMENT": Corresponds to "00", which is never a valid month.
   * - "POSSIBLE_MONTH": Corresponds to "01-12", potentially a month.
   * - "NOT_MONTH": Corresponds to "13-99", not a month.
   *
   * The logic proceeds as follows:
   * 1. If any segment is "INVALID_SEGMENT" or both are "NOT_MONTH", the pattern is ambiguous and considered "NA".
   * 2. If the first segment is a "POSSIBLE_MONTH":
   *    a. If the second segment is "NOT_MONTH", it's classified as Month-Year (MMYY).
   *    b. Otherwise (if the second is also a "POSSIBLE_MONTH"), the pattern is "AMBIGUOUS".
   * 3. If the first segment is "NOT_MONTH":
   *    a. If the second segment is a "POSSIBLE_MONTH", it's classified as Year-Month (YYMM).
   *    b. Otherwise (if the second is "NOT_MONTH" or "INVALID_SEGMENT"), it's considered "NA".
   */

  if (firstStatus === "INVALID_SEGMENT" || secondStatus === "INVALID_SEGMENT" || (firstStatus === "NOT_MONTH" && secondStatus === "NOT_MONTH")) {
    patternClassification = "NA";
  } else if (firstStatus === "POSSIBLE_MONTH") {
    if (secondStatus === "NOT_MONTH") {
      patternClassification = "MMYY";
    } else {
      patternClassification = "AMBIGUOUS";
    }
  } else {
    if (secondStatus === "POSSIBLE_MONTH") {
      patternClassification = "YYMM";
    } else {
      patternClassification = "NA";
    }
  }

  console.log(patternClassification);
}

analyzeDatePattern(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);