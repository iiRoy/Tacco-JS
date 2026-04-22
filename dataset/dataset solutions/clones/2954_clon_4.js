function isWithinMonthRange(valueToEvaluate) {
  return valueToEvaluate >= 1 && valueToEvaluate <= 12;
}

function classifyDateParts(sourceData) {
  const numericEntity = parseInt(sourceData.trim(), 10);

  const primarySegment = Math.floor(numericEntity / 100);
  const secondarySegment = numericEntity % 100;

  const primaryIsMonth = isWithinMonthRange(primarySegment);
  const secondaryIsMonth = isWithinMonthRange(secondarySegment);

  const determinationMatrix = {
    'true_true': 'AMBIGUOUS',
    'true_false': 'MMYY',
    'false_true': 'YYMM',
    'false_false': 'NA'
  };

  const classificationKey = `${primaryIsMonth}_${secondaryIsMonth}`;
  console.log(determinationMatrix[classificationKey]);
}

const fileSystemModule = require("fs");
const receivedContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
classifyDateParts(receivedContent);