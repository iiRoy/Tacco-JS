function processInputData(inputString) {
  // Split the input string into an array of individual characters
  const charArray = inputString.split('');

  // Extract the first two characters as the first pair string
  const firstPairStr = charArray[0] + charArray[1];
  // Extract the next two characters as the second pair string
  const secondPairStr = charArray[2] + charArray[3];

  // Determine the type of the first pair (MM, YY, or invalid)
  const firstPairType = checkMonthYearValidity(Number(firstPairStr));
  // Determine the type of the second pair (MM, YY, or invalid)
  const secondPairType = checkMonthYearValidity(Number(secondPairStr));

  let finalOutcome; // Variable to store the determined format type

  /*
   * Logic for determining the date format based on pair types:
   *
   * 'invalid_zero' (00) => NA (e.g., 00XX or XX00)
   * 'not_month' (>12) => NA (e.g., 20XX or XX20, where 20 is not a month)
   * 'is_month' (1-12) => Can be MM or YY
   *
   * Scenarios:
   * 00XX or XX00 => NA
   * >12XX or XX>12 => NA
   * 1-12 and 1-12 => AMBIGUOUS (e.g., 0102 could be Jan 02 or Feb 01)
   * 1-12 and >12 => MMYY (e.g., 0120 -> Jan 20)
   * >12 and 1-12 => YYMM (e.g., 2001 -> 20 Jan)
   */

  // Check for invalid cases: any pair is 'invalid_zero' (00), or both are 'not_month' (>12)
  if (firstPairType === 'invalid_zero' || secondPairType === 'invalid_zero' || (firstPairType === 'not_month' && secondPairType === 'not_month')) {
    finalOutcome = 'NA';
  }
  // If the first pair is a valid month (1-12)
  else if (firstPairType === 'is_month') {
    // If the second pair is not a month (>12), then it must be MMYY
    if (secondPairType === 'not_month') {
      finalOutcome = 'MMYY';
    }
    // If the second pair is also a valid month (1-12), it's ambiguous
    else { // secondPairType === 'is_month'
      finalOutcome = 'AMBIGUOUS';
    }
  }
  // If the first pair is not a month (>12)
  else { // firstPairType === 'not_month'
    // If the second pair is a valid month (1-12), then it must be YYMM
    if (secondPairType === 'is_month') {
      finalOutcome = 'YYMM';
    }
    // If the second pair is also not a month (this case should ideally be caught by the first 'if',
    // but included for completeness based on original structure)
    else { // secondPairType === 'not_month'
      finalOutcome = 'NA';
    }
  }

  // Output the determined format to the console
  console.log(finalOutcome);
}

/**
 * Determines the type of a numeric value in the context of month/year parsing.
 * @param {number} numericValue The two-digit number to evaluate.
 * @returns {string} 'invalid_zero' if 0, 'is_month' if between 1 and 12, 'not_month' otherwise.
 */
function checkMonthYearValidity(numericValue) {
  // If the value is 0, it's considered invalid for month/year parsing
  if (numericValue === 0) {
    return 'invalid_zero';
  }
  // If the value is between 1 and 12 (inclusive), it could be a month
  else if (numericValue >= 1 && numericValue <= 12) {
    return 'is_month';
  }
  // Otherwise, it's not a valid month (e.g., 13-99)
  else {
    return 'not_month';
  }
}

// Read input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
