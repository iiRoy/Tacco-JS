function createValueComparator(kindOfComparison, sortOrder) {
  let baseComparator;

  switch (kindOfComparison) {
    case "NUMERIC":
      baseComparator = (firstVal, secondVal) => parseFloat(firstVal) - parseFloat(secondVal);
      break;
    case "TEXT":
      baseComparator = (firstVal, secondVal) => {
        let strA = firstVal.toString();
        let strB = secondVal.toString();
        return strA > strB ? 1 : -1;
      };
      break;
    case "IGNORE_CASE":
      baseComparator = (firstVal, secondVal) => {
        let lowerA = firstVal.toString().toLowerCase();
        let lowerB = secondVal.toString().toLowerCase();
        return lowerA > lowerB ? 1 : -1;
      };
      break;
    default:
      baseComparator = (firstVal, secondVal) => 0;
  }

  return (firstVal, secondVal) => baseComparator(firstVal, secondVal) * sortOrder;
}

function processInputAndCalculate(sourceText) {
  const tokens = sourceText.match(/\S+/g) || [];

  const orderedValues = [...tokens].sort(createValueComparator("NUMERIC", -1));

  const totalDifference = orderedValues.reduce((accumulator, currentValue, currentIndex, array) => {
    if (currentIndex === 0) {
      return accumulator;
    }
    const previousValue = array[currentIndex - 1];
    return accumulator + Math.abs(Number(previousValue) - Number(currentValue));
  }, 0);

  console.log(totalDifference);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
