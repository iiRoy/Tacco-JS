const evaluateTextContent = (textPayload) => {
    const searchSequence = "AC";
    const possibleOutcomes = ["No", "Yes"];

    let isSequencePresent = false;
    for (let charIdx = 0; charIdx <= textPayload.length - searchSequence.length; charIdx++) {
        let matchFound = true;
        for (let seqIdx = 0; seqIdx < searchSequence.length; seqIdx++) {
            if (textPayload[charIdx + seqIdx] !== searchSequence[seqIdx]) {
                matchFound = false;
                break;
            }
        }
        if (matchFound) {
            isSequencePresent = true;
            break;
        }
    }

    process.stdout.write(possibleOutcomes[Number(isSequencePresent)] + "\n");
};

const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8");
evaluateTextContent(acquiredData);