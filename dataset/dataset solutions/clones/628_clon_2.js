// Type declarations for node environment
// Additional library types

function processSequence(dataLines: Array<string>)
{
	var elementCount = +dataLines.shift();
	var sourceValues: Array<number> = [];
	for (var idx = 0; idx < elementCount; ++idx) {
		sourceValues.push(+dataLines.shift());
	}

	var currentSum = 0;
	var prefixSums = [0];
	for (var idx = 0; idx < elementCount * 2; ++idx) {
		currentSum += sourceValues[idx % elementCount];
		prefixSums.push(currentSum);
	}


	var leftPtr = 0, midPtr = 0, rightPtr = 0;
	function calculateSegmentSum(segmentIndex: number): number {
		if (segmentIndex === 0) return prefixSums[midPtr] - prefixSums[leftPtr];
		if (segmentIndex === 1) return prefixSums[rightPtr] - prefixSums[midPtr];
		return prefixSums[leftPtr + elementCount] - prefixSums[rightPtr];
	}

	var maxSegmentValue = 0;
	while (leftPtr < elementCount) {
		while (1) {
			++midPtr;
			var tempRightPtr = rightPtr;
			while (calculateSegmentSum(0) > calculateSegmentSum(1) && calculateSegmentSum(2) >= calculateSegmentSum(0)) {
				++rightPtr;
			}
			if (calculateSegmentSum(2) < calculateSegmentSum(0)) {
				--midPtr;
				rightPtr = tempRightPtr;
				break;
			}
		}
		maxSegmentValue = Math.max(calculateSegmentSum(0), maxSegmentValue);
		++leftPtr;
	}
	console.log(maxSegmentValue);
}