function ProcessData(rawData) {
  "use strict";
  const textRows = rawData.split('\n');
  const itemCount = Number.parseInt(textRows[0], 10);
  const numericValues = textRows[1].split(' ').map(strVal => Number.parseInt(strVal, 10));

  let totalSum = 0;
  let previousVal = 0, currentVal = numericValues[0];
  for ( let idx = 0; idx < itemCount - 1; idx++ ) {
    previousVal = currentVal;
    currentVal = numericValues[idx + 1];
    if ( ( previousVal >= 0 && currentVal >= 0 ) || ( previousVal < 0 && currentVal < 0 ) ) {
      totalSum += Math.abs(previousVal);
      currentVal = Math.abs(currentVal);
      continue;
    } else if ( previousVal >= 0 && currentVal < 0 ) {
      if ( previousVal > Math.abs(currentVal) ) {
          totalSum += previousVal;
      } else {
        if ( numericValues[idx + 2] >= 0 ) {
          totalSum += previousVal;
        } else {
          totalSum -= previousVal;
          currentVal = -currentVal;
        }
      }
      continue;
    } else { // previousVal < 0 && currentVal >= 0
      if ( Math.abs(previousVal) > currentVal ) {
        totalSum -= previousVal;
        currentVal = -currentVal;
      } else {
        if ( numericValues[idx + 2] < 0 ) {
          totalSum -= previousVal;
          currentVal = -currentVal;
        } else {
          totalSum += previousVal;
        }
      }
      continue;
    }
  }
    
  console.log(totalSum + currentVal);
}
ProcessData( require('fs').readFileSync('/dev/stdin', 'utf8') );