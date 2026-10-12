function processDimensions(dataArray) {
  const initialHeightValue = Number(dataArray[0]);
  const initialWidthValue = Number(dataArray[1]);
  let unitsRemainingToCut = Number(dataArray[2]);

  let currentHeight = initialHeightValue;
  let currentWidth = initialWidthValue;
  let totalCutsMade = 0;

  while (unitsRemainingToCut > 0) {
    let dimensionToModify;
    let reductionAmountForUnits;

    if (currentHeight > currentWidth) {
      dimensionToModify = 'width';
      reductionAmountForUnits = currentHeight;
    } else {
      dimensionToModify = 'height';
      reductionAmountForUnits = currentWidth;
    }

    if (dimensionToModify === 'width') {
      currentWidth--;
    } else {
      currentHeight--;
    }

    unitsRemainingToCut -= reductionAmountForUnits;
    totalCutsMade++;
  }
  console.log(totalCutsMade);
}

processDimensions(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
