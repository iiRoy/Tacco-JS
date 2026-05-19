console.log(function(inputArgument) {
    const inputLines = inputArgument.trim().split('\n');
    const numSegments = Number(inputLines.shift());
    const segmentDetails = [];
    let overallBalance = 0;
    let startsWithOpen = 0;
    let endsWithClose = 0;

    for (let i = 0; i < numSegments; i++) {
        const currentSegmentString = inputLines[i];
        const firstChar = currentSegmentString[0];
        const lastChar = currentSegmentString[currentSegmentString.length - 1];
        let currentBalanceChange = 0;

        for (let j = 0; j < currentSegmentString.length; j++) {
            if (currentSegmentString[j] === '(') {
                currentBalanceChange++;
            } else if (currentSegmentString[j] === ')') {
                currentBalanceChange--;
            }
        }

        segmentDetails.push({ initialChar: firstChar, finalChar: lastChar, balanceValue: currentBalanceChange });
        overallBalance += currentBalanceChange;
        if (firstChar === '(') {
            startsWithOpen++;
        }
        if (lastChar === ')') {
            endsWithClose++;
        }
    }

    if (overallBalance !== 0 || !startsWithOpen || !endsWithClose) {
        return 'No';
    }
    if (numSegments === 1) {
        return 'Yes';
    }

    const allSegmentsUsedMask = (1 << numSegments) - 1;
    const possibleBalances = new Array(allSegmentsUsedMask + 1).fill(null).map(() => new Set());
    possibleBalances[0].add(0);

    for (let currentMask = 0; currentMask <= allSegmentsUsedMask; currentMask++) {
        if (possibleBalances[currentMask].size === 0) {
            continue;
        }

        for (const currentAccumulatedBalance of possibleBalances[currentMask]) {
            for (let segmentIdx = 0; segmentIdx < numSegments; segmentIdx++) {
                if ((currentMask & (1 << segmentIdx)) === 0) {
                    const nextMask = currentMask | (1 << segmentIdx);
                    const nextAccumulatedBalance = currentAccumulatedBalance + segmentDetails[segmentIdx].balanceValue;

                    if (nextAccumulatedBalance >= 0) {
                        if (nextMask === allSegmentsUsedMask) {
                            if (nextAccumulatedBalance === 0 && segmentDetails[segmentIdx].finalChar === ')') {
                                return 'Yes';
                            }
                        } else {
                            possibleBalances[nextMask].add(nextAccumulatedBalance);
                        }
                    }
                }
            }
        }
    }

    return 'No';
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
