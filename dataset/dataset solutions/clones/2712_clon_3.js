'use strict';
(function(sourceDataString){
  
  const processInputToNumbers = (dataStr) => {
    const trimmed = dataStr.trim();
    const parts = trimmed.split(/\s+/);
    return parts.map(part => Number(part));
  };

  const numericValues = processInputToNumbers(sourceDataString);
  
  const firstVal = numericValues[0];
  const secondVal = numericValues[1];
  const thirdVal = numericValues[2];

  const checkCondition = (k, x, y) => {
    const isKEven = (k % 2 === 0);
    const sumXY = x + y;
    const isSumXYOdd = (sumXY % 2 === 1);
    return isKEven && isSumXYOdd;
  };

  if(checkCondition(firstVal, secondVal, thirdVal)){
    console.log(-1);
    return;
  }

})(require('fs').readFileSync('/dev/stdin','utf8'));
