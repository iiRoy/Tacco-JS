'use strict';

function evaluateSource(receivedInput) {
    const initialSegment = receivedInput.substring(0, 3);
    const distinctGroup = new Set(initialSegment.split(''));
    const finalVerdict = distinctGroup.size === 3 ? "Yes" : "No";
    console.log(finalVerdict);
}

evaluateSource(require("node:fs").readFileSync(0, "utf8"));