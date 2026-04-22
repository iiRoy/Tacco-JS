function retrieveSourceData() {
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
}

function calculateTransformationsForSymmetry(initialContent) {
    const refinedContent = initialContent.replace(/^\s+|\s+$/g, '');
    const contentSize = refinedContent.length;

    if (contentSize <= 1) {
        return 0;
    }

    const indicesToExamine = Array.from({ length: Math.floor(contentSize / 2) }, (_, k) => k);

    const neededModifications = indicesToExamine.reduce((currentTotal, currentPosition) => {
        const mirrorPosition = contentSize - 1 - currentPosition;
        if (refinedContent[currentPosition] !== refinedContent[mirrorPosition]) {
            return currentTotal + 1;
        }
        return currentTotal;
    }, 0);

    return neededModifications;
}

function executeProcessing() {
    const rawInput = retrieveSourceData();
    const finalOutcome = calculateTransformationsForSymmetry(rawInput);
    console.log(finalOutcome);
}

executeProcessing();