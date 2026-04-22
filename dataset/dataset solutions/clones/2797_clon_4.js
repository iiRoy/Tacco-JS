"use strict";

const verifySequence = (inputDatum) => {
  const characterArray = inputDatum.trim().split('');
  
  const hasConsecutiveIdenticals = characterArray.slice(0, 3).some((value, position, collection) => {
    return value === collection[position + 1];
  });

  console.log(hasConsecutiveIdenticals ? "Bad" : "Good");
};

verifySequence(require('fs').readFileSync('/dev/stdin', 'utf8'));