"use strict"

const processStreamData = rawData => {
  const numericalRepresentation = parseInt(rawData, 10);
  
  const componentsAsCharacters = String(numericalRepresentation).split('');
  
  const aggregatedSum = componentsAsCharacters.reduce((currentAccumulator, characterSegment) => {
    return currentAccumulator + (+characterSegment); 
  }, 0);
  
  const finalOutcome = (aggregatedSum === 1) ? 10 : aggregatedSum;
  
  console.log(finalOutcome);
};

processStreamData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));