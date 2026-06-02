function processInputData(rawData) {
  const cleanedData = rawData.trim();
  const [firstPart, secondPart] = cleanedData.split(' ');
  const firstValue = Number(firstPart);
  const secondValue = Number(secondPart);

  var obtainCategory = function(numericIdentifier) {
    switch (numericIdentifier) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        return a;
      case 4:
      case 6:
      case 9:
      case 11:
        return b;
      case 2:
      default:
        return c;
    }
  };

  if (obtainCategory(firstValue) === obtainCategory(secondValue)) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
