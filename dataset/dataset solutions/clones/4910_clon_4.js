'use strict';
(function() {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const firstLineOfInput = rawInputContent.trim().split('\n')[0];
    const numericTokens = firstLineOfInput.split(' ').map(Number);

    const firstQuantity = numericTokens[0];
    const secondQuantity = numericTokens[1];

    let finalComputation;

    if (firstQuantity === 0) {
        finalComputation = secondQuantity;
    } else {
        finalComputation = secondQuantity * Math.pow(secondQuantity - 1, firstQuantity - 1);
    }

    console.log(finalComputation);
})();