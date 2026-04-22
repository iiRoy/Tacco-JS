process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function (dataBlock) {
  let currentText;
  const textRows = dataBlock.split("\n");
  let rowIterator, rowCount = textRows.length;
  let charIterator, charCount;
  let angularMeasure;
  let exponentVal;
  let upperBound;

  for (rowIterator = 0; rowIterator < rowCount; rowIterator++) {
    currentText = textRows[rowIterator];

    if (currentText === "#") {
      break;
    }
    
    currentText = currentText.replace(/north/g, 0);
    currentText = currentText.replace(/west/g, 1);
    
    angularMeasure = 0;

    charCount = currentText.length;
    exponentVal = currentText.length - 1;
    upperBound = 90 * Math.pow(2, exponentVal);

    for (charIterator = 0; charIterator < charCount; charIterator++) {
      if (currentText[charIterator] * 1) {
        if (angularMeasure < upperBound) {
          angularMeasure += 90 * Math.pow(2, exponentVal - charIterator);
        }
      } else {
        if (angularMeasure > 0) {
          angularMeasure -= 90 * Math.pow(2, exponentVal - charIterator);
        }
      }
    }

    while (exponentVal > 0 && angularMeasure % 2 === 0) {
      angularMeasure = angularMeasure / 2;
      exponentVal--;
    }
    
    if (exponentVal > 0) {
      console.log(angularMeasure + "/" + Math.pow(2, exponentVal));
    } else {
      console.log(angularMeasure);
    }
  }
});