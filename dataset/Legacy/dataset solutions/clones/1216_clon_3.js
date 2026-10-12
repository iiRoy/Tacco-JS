const INPUT_SOURCE_PATH = '/dev/stdin';
const SPACE_DELIMITER = ' ';

function performNumberComparison() {
  const fileSystemHandler = require('fs');
  const rawInputContent = fileSystemHandler.readFileSync(INPUT_SOURCE_PATH, 'utf8');

  const contentSegments = rawInputContent.split(SPACE_DELIMITER);

  const firstNumericValue = parseInt(contentSegments[0], 10);
  const secondNumericValue = parseInt(contentSegments[1], 10);

  let comparisonOutcomeMessage;

  if (firstNumericValue < secondNumericValue) {
    comparisonOutcomeMessage = "a < b";
  } else if (firstNumericValue > secondNumericValue) {
    comparisonOutcomeMessage = "a > b";
  } else {
    comparisonOutcomeMessage = "a == b";
  }

  console.log(comparisonOutcomeMessage);
}

performNumberComparison();
