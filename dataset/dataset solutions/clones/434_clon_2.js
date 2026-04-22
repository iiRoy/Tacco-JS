var nodeQuantity, neighborConnections;

function primaryExecution() {
	while (true) {
		var linkCount = acquireValue();
		nodeQuantity = acquireValue();
		if (nodeQuantity == 0 && linkCount == 0) {
			break;
		}

		neighborConnections = [];
		performIteration(nodeQuantity, function(idx) {
			neighborConnections[idx] = [];
		});
		performIteration(linkCount, function() {
			var originNode = acquireValue() - 1;
			var destNode = acquireValue() - 1;
			var costParam1 = acquireValue();
			var costParam2 = acquireValue();
			neighborConnections[originNode].push([costParam1, costParam2, destNode]);
			neighborConnections[destNode].push([costParam1, costParam2, originNode]);
		});

		var taskCount = acquireValue();
		performIteration(taskCount, function() {
			var initialPoint = acquireValue() - 1;
			var finalDestination = acquireValue() - 1;
			var metricType = acquireValue();
			displayResult(calculateShortestPath(initialPoint, finalDestination, metricType));
		});
	}
}

function calculateShortestPath(initialPoint, finalDestination, metricType) {
	var priorityQueue = [];

	function insertIntoHeap(elementItem) {
		var currentIndex = priorityQueue.length;
		while (currentIndex > 0) {
			var parentIndex = (currentIndex - 1) >> 1;

			if (priorityQueue[parentIndex] <= elementItem) {
				break;
			}

			priorityQueue[currentIndex] = priorityQueue[parentIndex];
			currentIndex = parentIndex;
		}
		priorityQueue[currentIndex] = elementItem;
	}

	function extractMinFromHeap() {
		var extractedMinimum = priorityQueue[0];

		var lastElement = priorityQueue[priorityQueue.length - 1];
		var currentLength = --priorityQueue.length;

		if (!currentLength) {
			return extractedMinimum;
		}

		var sinkIndex = 0;
		while (sinkIndex * 2 + 1 < currentLength) {
			var leftChildIdx = sinkIndex * 2 + 1;
			var rightChildIdx = sinkIndex * 2 + 2;

			if (rightChildIdx < currentLength && priorityQueue[rightChildIdx] < priorityQueue[leftChildIdx]) {
				leftChildIdx = rightChildIdx;
			}

			if (priorityQueue[leftChildIdx] >= lastElement) {
				break;
			}

			priorityQueue[sinkIndex] = priorityQueue[leftChildIdx];
			sinkIndex = leftChildIdx;
		}
		priorityQueue[sinkIndex] = lastElement;

		return extractedMinimum;
	}

	function isHeapEmpty() {
		return !priorityQueue.length;
	}

	var shortestPaths = [];
	performIteration(nodeQuantity, function(idx) {
		shortestPaths[idx] = Infinity;
	});

	shortestPaths[initialPoint] = 0;
	insertIntoHeap([0, initialPoint]);
	while (!isHeapEmpty()) {
		var nodeState = extractMinFromHeap();

		if (nodeState[0] > shortestPaths[nodeState[1]]) {
			continue;
		}

		performIteration(neighborConnections[nodeState[1]].length, function(idx) {
			var connectionDetail = neighborConnections[nodeState[1]][idx];
			if (shortestPaths[connectionDetail[2]] > shortestPaths[nodeState[1]] + connectionDetail[metricType]) {
				shortestPaths[connectionDetail[2]] = shortestPaths[nodeState[1]] + connectionDetail[metricType];
				insertIntoHeap([shortestPaths[connectionDetail[2]], connectionDetail[2]]);
			}
		});
	}

	return shortestPaths[finalDestination];
}

function performIteration(startVal, endVal, callbackFunc) {
	if (callbackFunc == null) {
		callbackFunc = endVal;
		endVal = startVal;
		startVal = 0;
	}
	for (var loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
		callbackFunc(loopCounter);
	}
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = '';
var bufferPosition = 0;

function acquireValue(dataType) {
	if (dataType === 'string') {
		return inputBuffer[bufferPosition++];
	} else {
		return +inputBuffer[bufferPosition++];
	}
}

function displayResult(outputVal) {
	console.log(outputVal);
}

process.stdin.on('data', function(dataChunk) {
	inputBuffer += dataChunk;
});
process.stdin.on('end', function() {
	inputBuffer = inputBuffer.split(/\s+/);
	primaryExecution();
});