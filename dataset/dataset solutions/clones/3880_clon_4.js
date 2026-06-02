const parseNumericValues = (sourceText) => sourceText.split(/\s|\n/).map(Number);

const calculatePrimaryComponent = (firstVal, secondVal, thirdVal, fourthVal, fifthVal) => {
  const sumOfFirstTwo = firstVal + secondVal;
  const averageOfFirstTwo = sumOfFirstTwo / 2;
  const minimumOfLastTwo = Math.min(fourthVal, fifthVal);

  return (averageOfFirstTwo > thirdVal ? (thirdVal * 2) : sumOfFirstTwo) * minimumOfLastTwo;
};

const calculateSecondaryComponent = (firstVal, secondVal, fourthVal, fifthVal) => {
  return (fourthVal > fifthVal
    ? (firstVal * (fourthVal - fifthVal))
    : (secondVal * (fifthVal - fourthVal)));
};

function deriveTotalCost(sourceData) {
  const [paramA, paramB, paramC, paramD, paramE] = parseNumericValues(sourceData);

  const primaryResult = calculatePrimaryComponent(paramA, paramB, paramC, paramD, paramE);
  const secondaryResult = calculateSecondaryComponent(paramA, paramB, paramD, paramE);

  console.log(primaryResult + secondaryResult);
}

deriveTotalCost(require('fs').readFileSync('/dev/stdin', 'utf8'));
