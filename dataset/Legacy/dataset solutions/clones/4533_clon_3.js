const getParenthesisChar = (index) => (index % 2 === 0) ? "(" : ")";

function processParenthesesBalance(rawInput) {
    const inputLines = rawInput.split("\n");
    const sequenceLength = parseInt(inputLines[0], 10);
    const charSequence = inputLines[1].split("");

    const segmentCounts = new Array(sequenceLength + 1).fill(0);

    let currentSegmentIndex = 0;

    if (charSequence[0] === ")") {
        currentSegmentIndex = 1;
    }
    segmentCounts[currentSegmentIndex]++;

    for (let i = 1; i < sequenceLength; i++) {
        if (charSequence[i] === charSequence[i - 1]) {
            segmentCounts[currentSegmentIndex]++;
        } else {
            currentSegmentIndex++;
            segmentCounts[currentSegmentIndex]++;
        }
    }

    let overallBalanceDelta = 0;
    for (let i = 0; i < sequenceLength; i += 2) {
        overallBalanceDelta += (segmentCounts[i] - segmentCounts[i + 1]);
    }

    if (overallBalanceDelta < 0) {
        segmentCounts[0] -= overallBalanceDelta;
    } else if (overallBalanceDelta > 0) {
        let adjustmentSearchIndex = sequenceLength;
        while (adjustmentSearchIndex >= 0) {
            if (segmentCounts[adjustmentSearchIndex] > 0) {
                if (adjustmentSearchIndex % 2 === 0) {
                    segmentCounts[adjustmentSearchIndex + 1] += overallBalanceDelta;
                } else {
                    segmentCounts[adjustmentSearchIndex] += overallBalanceDelta;
                }
                break;
            }
            adjustmentSearchIndex--;
        }
    } else {
        if (segmentCounts[0] < segmentCounts[1]) {
            const initialSegmentCorrectionAmount = segmentCounts[1] - segmentCounts[0];
            segmentCounts[0] = segmentCounts[1];

            let correctionSearchIndex = sequenceLength;
            while (correctionSearchIndex >= 0) {
                if (segmentCounts[correctionSearchIndex] > 0) {
                    if (correctionSearchIndex % 2 === 0) {
                        segmentCounts[correctionSearchIndex + 1] = segmentCounts[correctionSearchIndex];
                    } else {
                        segmentCounts[correctionSearchIndex] += initialSegmentCorrectionAmount;
                    }
                    break;
                }
                correctionSearchIndex--;
            }
        }
    }

    const finalOutputParts = [];
    for (let i = 0; i < sequenceLength; i++) {
        const charToAppend = getParenthesisChar(i);
        if (segmentCounts[i] > 0) {
            finalOutputParts.push(charToAppend.repeat(segmentCounts[i]));
        }
    }

    console.log(finalOutputParts.join(""));
}

processParenthesesBalance(require("fs").readFileSync("/dev/stdin", "utf8"));
