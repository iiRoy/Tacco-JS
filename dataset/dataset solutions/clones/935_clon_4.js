var log = console.log;
if (typeof process != "undefined") {
	var inputBuffer = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (chunk) {
		inputBuffer += chunk;
	});
	process.stdin.on('end', function () {
		var allInputLines = inputBuffer.split("\n");
		processInputChunks(allInputLines);
	});
}

function processInputChunks(allInputLines) {
    const relevantDataSegments = allInputLines.slice(1);

    for (let segmentIndex = 0; segmentIndex < relevantDataSegments.length; segmentIndex += 2) {
        try {
            const firstSequence = relevantDataSegments[segmentIndex].replace(/[^a-z]/g, '');
            const secondSequence = relevantDataSegments[segmentIndex + 1].replace(/[^a-z]/g, '');

            if (firstSequence.length === 0 || secondSequence.length === 0) {
                log(undefined);
            } else {
                const memoizationStore = new Map();

                const finalMetricValue = calculateMetric(
                    firstSequence.length - 1,
                    secondSequence.length - 1,
                    firstSequence,
                    secondSequence,
                    memoizationStore
                );
                log(finalMetricValue);
            }
        } catch (errorInstance) {
            log(errorInstance);
        }
    }
}

function calculateMetric(rowIdx, colIdx, seqA, seqB, memoCache) {
    const cacheKey = `${rowIdx},${colIdx}`;

    if (memoCache.has(cacheKey)) {
        return memoCache.get(cacheKey);
    }

    const currentMatchIndicator = (seqA.charAt(rowIdx) === seqB.charAt(colIdx) ? 1 : 0);
    let computedResult;

    if (rowIdx === 0 && colIdx === 0) {
        computedResult = currentMatchIndicator;
    } else if (rowIdx === 0) {
        computedResult = Math.max(calculateMetric(rowIdx, colIdx - 1, seqA, seqB, memoCache), currentMatchIndicator);
    } else if (colIdx === 0) {
        computedResult = Math.max(calculateMetric(rowIdx - 1, colIdx, seqA, seqB, memoCache), currentMatchIndicator);
    } else {
        const valueFromAbove = calculateMetric(rowIdx - 1, colIdx, seqA, seqB, memoCache);
        const valueFromLeft = calculateMetric(rowIdx, colIdx - 1, seqA, seqB, memoCache);
        
        computedResult = Math.min(
            Math.max(valueFromAbove, valueFromLeft) + currentMatchIndicator,
            Math.min(rowIdx, colIdx) + 1
        );
    }

    memoCache.set(cacheKey, computedResult);
    return computedResult;
}
