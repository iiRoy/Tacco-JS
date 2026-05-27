function processStream(dataPayload) {
    let currentLineSegment = '';
    for (let charPosition = 0; charPosition < dataPayload.length; charPosition++) {
        if (dataPayload[charPosition] === '\n') {
            break;
        }
        currentLineSegment += dataPayload[charPosition];
    }

    let outcomeIndicator = false;
    const targetSequence = "YAKI";

    if (currentLineSegment.length >= targetSequence.length) {
        let sequenceMatches = true;
        for (let idx = 0; idx < targetSequence.length; idx++) {
            if (currentLineSegment[idx] !== targetSequence[idx]) {
                sequenceMatches = false;
                break;
            }
        }
        outcomeIndicator = sequenceMatches;
    }

    console.log(outcomeIndicator ? "Yes" : "No");
}

processStream(require("fs").readFileSync("/dev/stdin", "utf8"));
