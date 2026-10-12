'use strict';
(function(sourceData){
  const numericInputs = sourceData.trim().split(' ').reduce((acc, current, index) => {
    if (index === 0) acc.alpha = Number(current);
    else if (index === 1) acc.beta = Number(current);
    else if (index === 2) acc.kappa = Number(current);
    return acc;
  }, {});

  const { alpha, beta, kappa } = numericInputs;

  const ensureNonNegative = (value) => value > 0 ? value : 0;

  const delta = ensureNonNegative(kappa - alpha);

  const finalAlphaValue = ensureNonNegative(alpha - kappa);
  const finalBetaValue = ensureNonNegative(beta - delta);

  console.log(`${finalAlphaValue} ${finalBetaValue}`);
})(require('fs').readFileSync('/dev/stdin','utf8'));
