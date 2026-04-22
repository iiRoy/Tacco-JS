const grabNumberFromText = (payload) => {
  let startIdx = 0;
  while (startIdx < payload.length && (payload[startIdx] === ' ' || payload[startIdx] === '\t' || payload[startIdx] === '\n' || payload[startIdx] === '\r')) {
    startIdx++;
  }
  let endIdx = payload.length - 1;
  while (endIdx >= 0 && (payload[endIdx] === ' ' || payload[endIdx] === '\t' || payload[endIdx] === '\n' || payload[endIdx] === '\r')) {
    endIdx--;
  }
  const trimmedPayload = (startIdx <= endIdx) ? payload.substring(startIdx, endIdx + 1) : '';

  if (trimmedPayload.length === 0) {
    return NaN;
  }

  let numericalRepresentation = 0;
  let hasDigits = false;

  for (let currentPosition = 0; currentPosition < trimmedPayload.length; currentPosition++) {
    const char = trimmedPayload[currentPosition];
    const digitValue = char.charCodeAt(0) - '0'.charCodeAt(0);

    if (digitValue >= 0 && digitValue <= 9) {
      numericalRepresentation = numericalRepresentation * 10 + digitValue;
      hasDigits = true;
    } else {
      break;
    }
  }

  if (!hasDigits) {
    return NaN;
  }

  return numericalRepresentation;
};

const thresholdCategories = [
  { upperLimit: 1199, label: "ABC" },
  { upperLimit: 2799, label: "ARC" },
  { upperLimit: Infinity, label: "AGC" }
];

const categorizeScore = (numericRating) => {
  if (Number.isNaN(numericRating)) {
    return "AGC";
  }

  for (let k = 0; k < thresholdCategories.length; k++) {
    if (numericRating <= thresholdCategories[k].upperLimit) {
      return thresholdCategories[k].label;
    }
  }
  return "UNKNOWN_CATEGORY";
};

const displayResult = (content) => {
  process.stdout.write(content + '\n');
};

const inputData = process.argv[2];
const ratingValue = grabNumberFromText(inputData);
const classificationString = categorizeScore(ratingValue);
displayResult(classificationString);