"use strict";

(function() {
    const supplyRawStreamContent = () => require('fs').readFileSync('/dev/stdin', 'utf8');

    const decipherPrimaryOperands = (streamContent) => {
        const extractionPattern = /^(-?\d+)\s+(-?\d+)/;
        const foundSegments = streamContent.match(extractionPattern);
        if (!foundSegments || foundSegments.length < 3) {
            throw new Error("Input format mismatch: Expected two numerical entries.");
        }
        return [parseInt(foundSegments[1], 10), parseInt(foundSegments[2], 10)];
    };

    const deriveFinalValue = ([primary, secondary]) => {
        return primary + 1 - secondary;
    };

    const presentOutcome = (finalResult) => {
        console.log(finalResult);
    };

    presentOutcome(
        deriveFinalValue(
            decipherPrimaryOperands(
                supplyRawStreamContent()
            )
        )
    );
})();