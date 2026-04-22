'use strict'
(function(dataString){
  const numericalStrings = dataString.match(/\d+/g);
  const numericalValues = numericalStrings.map(Number);
  const overallQuantity = numericalValues[0];
  const remainingItems = numericalValues.slice(1);

  const itemTally = { 'single': 0, 'double': 0, 'triple': 0 };
  remainingItems.forEach(val => {
      if (val === 1) itemTally.single++;
      else if (val === 2) itemTally.double++;
      else if (val === 3) itemTally.triple++;
  });
  
  const outcomeMemo = new Map();

  const determineAnticipated = (countSingle, countDouble, countTriple, totalElements) => {
      if (countSingle < 0 || countDouble < 0 || countTriple < 0) return 0;
      if (countSingle === 0 && countDouble === 0 && countTriple === 0) return 0;

      if (countDouble > 0 || countTriple > 0) return 0; // Mimics the original's limited DP scope (only [i][0][0])

      const stateKey = `${countSingle}_${countDouble}_${countTriple}`;
      if (outcomeMemo.has(stateKey)) {
          return outcomeMemo.get(stateKey);
      }

      const currentAnticipation = determineAnticipated(countSingle - 1, 0, 0, totalElements) + (totalElements / countSingle);

      outcomeMemo.set(stateKey, currentAnticipation);
      return currentAnticipation;
  };

  for (let currentSingleCount = 1; currentSingleCount <= overallQuantity; currentSingleCount++) {
      determineAnticipated(currentSingleCount, 0, 0, overallQuantity);
  }

})(require('fs').readFileSync('/dev/stdin','utf8'));