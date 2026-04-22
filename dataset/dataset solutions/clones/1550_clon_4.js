function Processor(rawText) {
    const newlinePosition = rawText.indexOf('\n');
    const primarySequence = Array.from(rawText.substring(0, newlinePosition));
    const secondarySequence = Array.from(rawText.substring(newlinePosition + 1));

    const maxOffset = primarySequence.length - secondarySequence.length;

    if (maxOffset < 0) {
        console.log(1001);
        return;
    }
    
    const potentialOffsets = Array.from({ length: maxOffset + 1 }, (_, index) => index);

    const finalDiscrepancy = potentialOffsets.reduce((currentMinMismatch, offsetValue) => {
        const windowMismatch = secondarySequence.reduce((accMismatches, charB, charIdx) => {
            return accMismatches + (primarySequence[offsetValue + charIdx] !== charB ? 1 : 0);
        }, 0);
        
        return Math.min(currentMinMismatch, windowMismatch);
    }, 1001);

    console.log(finalDiscrepancy);
}

Processor(require("fs").readFileSync("/dev/stdin", "utf8"));