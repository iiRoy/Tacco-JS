function evaluateRanges(incomingText) {
    const numericSegments = incomingText.split(" ").map(Number);

    const commencementPointA = numericSegments[0];
    const terminationPointA = numericSegments[1];
    const commencementPointB = numericSegments[2];
    const terminationPointB = numericSegments[3];

    const combinedStart = Math.max(commencementPointA, commencementPointB);
    const combinedEnd = Math.min(terminationPointA, terminationPointB);

    const finalCount = Math.max(0, combinedEnd - combinedStart + 1);

    console.log(finalCount);
}

evaluateRanges(require("node:fs").readFileSync(0, "utf8"));