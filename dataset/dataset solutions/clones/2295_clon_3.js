'use strict';
(function(sourceData){
  const trimmedData = sourceData.trim();
  const partsArray = trimmedData.split(' ');

  const valA = Number(partsArray[0]);
  const valB = Number(partsArray[1]);
  const valK = Number(partsArray[2]);

  const kMinusA = valK - valA;
  const remainingK = Math.max(0, kMinusA);

  const aMinusK = valA - valK;
  const firstResultComponent = Math.max(0, aMinusK);

  const bMinusRemainingK = valB - remainingK;
  const secondResultComponent = Math.max(0, bMinusRemainingK);

  const outputComponents = [firstResultComponent, secondResultComponent];
  const finalOutputString = outputComponents.join(' ');
  console.log(finalOutputString);

})(require('fs').readFileSync('/dev/stdin','utf8'));
