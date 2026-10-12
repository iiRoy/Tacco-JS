var os = require('os');

function run (main) {
	const inputSource = process.stdin;
	const outputSink = process.stdout;

	let remainingInput = '';
	let tokenBuffer = [];
	let inputFinished = false;
	const WORD_MODE_IDENTIFIER = 'word';
	const LINE_MODE_IDENTIFIER = 'line';
	let currentInputParsingMode = WORD_MODE_IDENTIFIER;

	const outputLineWriter = (content, terminator) => {
		outputSink.write(content + (terminator === undefined ? os.EOL : terminator));
	};

	const lineInputRequester = function* () {
		if (tokenBuffer.length > 0 && currentInputParsingMode === LINE_MODE_IDENTIFIER) {
			return tokenBuffer.shift();
		} else {
			currentInputParsingMode = LINE_MODE_IDENTIFIER;
			const valueFromDriver = yield;
			currentInputParsingMode = WORD_MODE_IDENTIFIER;
			return valueFromDriver;
		}
	};

	const mainProgramIterator = main(outputLineWriter, lineInputRequester);
	let lastMainResult = mainProgramIterator.next();

	const processInputChunk = (chunk) => {
		inputSource.pause();
		if (null === chunk) {
			inputFinished = true;
		} else {
			remainingInput += chunk;
		}
		driveExecutionLoop();
	};

	const fillTokenBuffer = () => {
		if (tokenBuffer.length > 0) return;

		if (currentInputParsingMode === LINE_MODE_IDENTIFIER) {
			const linePattern = /.*(\r?\n|\r)/;
			const lineMatch = remainingInput.match(linePattern);
			if (lineMatch) {
				tokenBuffer.push(lineMatch[0].trimEnd());
				remainingInput = remainingInput.substring(lineMatch[0].length);
			} else if (inputFinished && remainingInput.length > 0) {
				tokenBuffer.push(remainingInput);
				remainingInput = '';
			}
		} else { // WORD_MODE_IDENTIFIER
			const wordPattern = /^\s*(\S+)/;
			const wordMatch = remainingInput.match(wordPattern);
			if (wordMatch) {
				tokenBuffer.push(wordMatch[1]);
				remainingInput = remainingInput.substring(wordMatch[0].length);
			} else if (inputFinished && remainingInput.trim().length > 0) {
				const finalWordMatch = remainingInput.trim().match(/^(\S+)/);
				if (finalWordMatch) {
					tokenBuffer.push(finalWordMatch[1]);
					remainingInput = '';
				}
			}
		}
	};

	const driveExecutionLoop = () => {
		while (!lastMainResult.done) {
			fillTokenBuffer();

			if (tokenBuffer.length > 0) {
				const nextInputToken = tokenBuffer.shift();
				lastMainResult = mainProgramIterator.next(nextInputToken);
			} else if (inputFinished) {
				lastMainResult = mainProgramIterator.next(null);
			} else {
				inputSource.resume();
				return;
			}

			if (lastMainResult.value !== undefined) {
				outputLineWriter(String(lastMainResult.value), "");
			}
		}
	};

	inputSource.on('data', processInputChunk);
	inputSource.on('end', () => {
		inputFinished = true;
		processInputChunk(null);
	});

	inputSource.setEncoding('utf8');
	processInputChunk(null);
};

run (function * (outputWriter, lineInputRequester) {
	const initialWhiteCount = +(yield) - 1;
	const initialBlackCount = +(yield) - 1;
	const outputGridRows = [];

	const generateGridSegment = (segmentCount, activePatternPair, inactivePatternPair) => {
		const segmentArray = Array.from({ length: 50 }, (_, segmentIndex) => {
			return segmentIndex < segmentCount ? activePatternPair : inactivePatternPair;
		});
		return [segmentArray.map(p => p[0]).join(''), segmentArray.map(p => p[1]).join('')];
	};

	const whiteTilePatterns = {
		active: ['.#', '##'],
		inactive: ['##', '##']
	};
	const blackTilePatterns = {
		active: ['..', '#.'],
		inactive: ['..', '..']
	};

	let currentWhiteTiles = initialWhiteCount;
	while (currentWhiteTiles > 0) {
		const tilesToColorInThisPair = Math.min(currentWhiteTiles, 50);
		const [segmentRowA, segmentRowB] = generateGridSegment(
			tilesToColorInThisPair,
			whiteTilePatterns.active,
			whiteTilePatterns.inactive
		);
		outputGridRows.push(segmentRowA, segmentRowB);
		currentWhiteTiles -= 50;
	}

	let currentBlackTiles = initialBlackCount;
	while (currentBlackTiles > 0) {
		const tilesToColorInThisPair = Math.min(currentBlackTiles, 50);
		const [segmentRowA, segmentRowB] = generateGridSegment(
			tilesToColorInThisPair,
			blackTilePatterns.active,
			blackTilePatterns.inactive
		);
		outputGridRows.push(segmentRowA, segmentRowB);
		currentBlackTiles -= 50;
	}

	outputWriter(`${outputGridRows.length} 100`);
	for (const gridRow of outputGridRows) {
		outputWriter(gridRow);
	}
});
