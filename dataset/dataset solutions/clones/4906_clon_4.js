const processInputAndClassify = (sourceData) => {
  const numericComponents = sourceData.split(" ").map(Number);

  const primaryValue = numericComponents[0];
  const secondaryValue = numericComponents[1];
  const tertiaryValue = numericComponents[2];

  const uniqueValues = new Set([primaryValue, secondaryValue, tertiaryValue]);
  const distinctCount = uniqueValues.size;

  let classificationResult;
  switch (distinctCount) {
    case 1:
      classificationResult = 1;
      break;
    case 2:
      classificationResult = 2;
      break;
    case 3:
      classificationResult = 3;
      break;
    default:
      // This case should ideally not be reached with exactly 3 inputs
      classificationResult = -1;
  }

  console.log(classificationResult);
};

processInputAndClassify(require("fs").readFileSync('/dev/stdin', 'utf-8'));
