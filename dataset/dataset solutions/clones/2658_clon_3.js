'use strict';
(function(inputStringParam){
  
  const trimmedInputContent = inputStringParam.trim();
  const stringValueArray = trimmedInputContent.split(/\s+/);
  
  const numericValues = stringValueArray.map(strItem => parseInt(strItem, 10));

  const kFactor = numericValues[0];
  const xCenterPoint = numericValues[1];

  const generatedSequence = [];

  const startRange = xCenterPoint - kFactor + 1;
  const endRange = xCenterPoint + kFactor - 1;

  for(let currentIterationValue = startRange; currentIterationValue <= endRange; currentIterationValue++) {
    generatedSequence.push(currentIterationValue);
  }
  
  const outputResult = generatedSequence.join(' ');
  console.log(outputResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
