'use strict'
((incomingData) => {
    const acquireNumericValue = (contentPiece) => {
        if (contentPiece.trim().length === 0) {
            return 0;
        }

        const exactNumericPattern = /^\s*([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)\s*$/;
        const currentMatch = contentPiece.match(exactNumericPattern);

        if (currentMatch) {
            return parseFloat(currentMatch[1]);
        } else {
            return NaN;
        }
    };

    const evaluatedSource = acquireNumericValue(incomingData);
    const finalOutcome = Math.pow(evaluatedSource, 2);

    console.log(finalOutcome);

})(require("fs").readFileSync("/dev/stdin", "utf8"));