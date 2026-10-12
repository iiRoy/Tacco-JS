var log = console.log;

if (typeof process != "undefined") {
	var collectedInput = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (piece) {
		collectedInput += piece;
	});
	process.stdin.on('end', function () {
		run(collectedInput.split("\n"));
	});
}

function run(allLines) {
	var remaining = allLines.slice(1);
	while (remaining.length > 0) {
		try {
			var pair = remaining.slice(0, 2).map(keepLowercaseLetters);
			measurePair(pair);
			remaining = remaining.slice(2);
		} catch (error) {
			log(error);
		}
	}
}

function keepLowercaseLetters(text) {
	var found = text.match(/[a-z]/g);
	return found ? found.join("") : "";
}

function cellId(row, col) {
	return row + ":" + col;
}

function measurePair(pair) {
	var left = pair[0];
	var right = pair[1];

	if (left.length === 0) {
		var emptyTable = [];
		var rowAfterLoop = 0;
		var colAfterLoop;
		log(emptyTable[rowAfterLoop - 1][colAfterLoop - 1]);
		return;
	}

	if (right.length === 0) {
		log(undefined);
		return;
	}

	var score = new Map();
	var lastLayer = left.length + right.length - 2;

	for (var layer = 0; layer <= lastLayer; layer++) {
		var rowStart = Math.max(0, layer - right.length + 1);
		var rowEnd = Math.min(left.length - 1, layer);

		for (var row = rowStart; row <= rowEnd; row++) {
			var col = layer - row;
			var hit = left.charAt(row) == right.charAt(col) ? 1 : 0;
			var best;

			if (row === 0 && col === 0) {
				best = hit;
			} else if (row === 0) {
				best = Math.max(score.get(cellId(row, col - 1)), hit);
			} else if (col === 0) {
				best = Math.max(score.get(cellId(row - 1, col)), hit);
			} else {
				var fromTop = score.get(cellId(row - 1, col));
				var fromLeft = score.get(cellId(row, col - 1));
				best = Math.min(Math.max(fromTop, fromLeft) + hit, Math.min(row, col) + 1);
			}

			score.set(cellId(row, col), best);
		}
	}

	log(score.get(cellId(left.length - 1, right.length - 1)));
}
