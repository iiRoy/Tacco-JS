function processInput(rawText) {
  const cleanText = rawText.trim();
  const targetValue = Number.parseInt(cleanText.split(" ")[0], 10);

  let representationFound = false;

  for (let firstCoefficient = 0; firstCoefficient <= 25; firstCoefficient++) {
    const currentFourMultiple = 4 * firstCoefficient;
    const requiredForSevenMultiple = targetValue - currentFourMultiple;

    if (requiredForSevenMultiple < 0) {
      break;
    }

    if (requiredForSevenMultiple % 7 === 0) {
      const secondCoefficient = requiredForSevenMultiple / 7;

      if (secondCoefficient >= 0 && secondCoefficient <= 15) {
        representationFound = true;
        break;
      }
    }
  }

  if (representationFound) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
