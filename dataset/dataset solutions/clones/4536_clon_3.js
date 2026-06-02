function ProcessInput(rawData) {
    const lines = rawData.split("\n");
    const sequenceLength = parseInt(lines[0], 10);
    const charSequence = lines[1].split("");

    const initializeFirstSegment = (firstChar, segmentArray) => {
        let currentSegmentIdx = 0;
        if (firstChar === ")") {
            currentSegmentIdx = 1;
        }
        segmentArray[currentSegmentIdx]++;
        return currentSegmentIdx;
    };

    let segmentLengths = new Array(sequenceLength + 1).fill(0);
    let segmentIndex = initializeFirstSegment(charSequence[0], segmentLengths);

    for (let idx = 1; idx < sequenceLength; idx++) {
        if (charSequence[idx] === charSequence[idx - 1]) {
            segmentLengths[segmentIndex]++;
        } else {
            segmentIndex++;
            segmentLengths[segmentIndex]++;
        }
    }

    let cumulativeDifference = 0;

    for (let idx = 0; idx < sequenceLength; idx += 2) {
        const currentOpenSegmentLength = segmentLengths[idx];
        const currentCloseSegmentLength = segmentLengths[idx + 1];
        cumulativeDifference += (currentOpenSegmentLength - currentCloseSegmentLength);
    }

    let finalResult = "";
    let effectiveSegmentPointer = sequenceLength;

    const findLastActiveSegmentIndex = (arr, maxIndex) => {
        for (let i = maxIndex; i >= 0; i--) {
            if (arr[i] > 0) {
                return i;
            }
        }
        return 0;
    };

    if (cumulativeDifference < 0) {
        segmentLengths[0] -= cumulativeDifference;
    } else if (cumulativeDifference > 0) {
        const initialBalanceCheck = segmentLengths[0] - segmentLengths[1];
        if (initialBalanceCheck < 0) {
            cumulativeDifference += Math.abs(initialBalanceCheck);
            segmentLengths[0] = segmentLengths[1];
        }

        effectiveSegmentPointer = findLastActiveSegmentIndex(segmentLengths, sequenceLength);
        if (effectiveSegmentPointer % 2 === 0) {
            segmentLengths[effectiveSegmentPointer + 1] += cumulativeDifference;
        } else {
            segmentLengths[effectiveSegmentPointer] += cumulativeDifference;
        }
    } else {
        const initialBalanceCheck = segmentLengths[0] - segmentLengths[1];
        if (initialBalanceCheck < 0) {
            const balanceAdjustmentAmount = Math.abs(initialBalanceCheck);
            segmentLengths[0] = segmentLengths[1];

            effectiveSegmentPointer = findLastActiveSegmentIndex(segmentLengths, sequenceLength);
            if (effectiveSegmentPointer % 2 === 0) {
                segmentLengths[effectiveSegmentPointer + 1] = segmentLengths[effectiveSegmentPointer];
            } else {
                segmentLengths[effectiveSegmentPointer] += balanceAdjustmentAmount;
            }
        }
    }

    const charBuffer = [];
    for (let idx = 0; idx < sequenceLength; idx++) {
        const segmentLen = segmentLengths[idx];
        if (segmentLen > 0) {
            const charToAppend = (idx % 2 === 0) ? "(" : ")";
            for (let jdx = 0; jdx < segmentLen; jdx++) {
                charBuffer.push(charToAppend);
            }
        }
    }
    finalResult = charBuffer.join('');

    console.log(finalResult);
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
