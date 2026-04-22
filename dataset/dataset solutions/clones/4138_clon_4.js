function processIncomingInformation(incomingInformation) {
    const numericPatternExtractor = /(\d+)\s+(\d+)/;
    const extractedParts = incomingInformation.match(numericPatternExtractor);

    const baseQuantity = parseInt(extractedParts[1], 10);
    const limitQuantity = parseInt(extractedParts[2], 10);

    let currentRatio = limitQuantity / baseQuantity;
    let logarithmicExponent = 0;

    while (currentRatio >= 2) {
        currentRatio /= 2;
        logarithmicExponent++;
    }

    const outcomeMetric = logarithmicExponent + 1;

    console.log(outcomeMetric);
}

processIncomingInformation(require("fs").readFileSync("/dev/stdin", "utf8"));