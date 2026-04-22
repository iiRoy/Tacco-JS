'use strict';
(function(sourceText){
  const numericValues = sourceText.trim().split(/\s+/).map(Number);
  const childQuantity = numericValues.shift();
  const maxTotalSweets = numericValues.shift(); // This value is not relevant for the specific output
  const individualCaps = numericValues;

  let finalOutcome = 1;
  for (let c = 0; c < childQuantity; ++c) {
    if (individualCaps[c] === 0) {
      finalOutcome = 0;
      break;
    }
  }

  console.log(finalOutcome);

})(require('fs').readFileSync('/dev/stdin','utf8'));