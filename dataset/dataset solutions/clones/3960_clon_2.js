initiateProcess (function * (outputWriter, inputFetcher) {
	var counterOne = +(yield) - 1;
	var counterTwo = +(yield) - 1;
	var generatedRows = [];
	do {
		var rowStringA = "" , rowStringB = "";
		for ( var loopCounter = 0; loopCounter < 100; loopCounter += 2 ) {
			if ( 0 < counterOne ) {
				rowStringA += ".#";
				rowStringB += "##";
				--counterOne;
			} else {
				rowStringA += "##";
				rowStringB += "##";
			}
		}
		generatedRows.push(rowStringA, rowStringB);
	}   while (0 < counterOne);
	do {
		var rowStringA = "" , rowStringB = "";
		for ( var loopCounter = 0; loopCounter < 100; loopCounter += 2 ) {
			if ( 0 < counterTwo ) {
				rowStringA += "..";
				rowStringB += "#.";
				--counterTwo;
			} else {
				rowStringA += "..";
				rowStringB += "..";
			}
		}
		generatedRows.push(rowStringA, rowStringB);
	} while (0 < counterTwo);
	outputWriter ( `${generatedRows.length} 100` );
	for ( var loopCounter = 0; loopCounter < generatedRows.length; ++loopCounter ) {
		outputWriter(generatedRows[loopCounter]);
	}
});

/**
 * Initializes and runs the primary generator handler.
 * @param {(outputWriter: (textString: string, terminatorChar?: string) => void, inputFetcher: () => IterableIterator<string|null>) => IterableIterator<any>} primaryHandler
 */
function initiateProcess (primaryHandler) {
	var inputStream = process.stdin;
	var outputStream = process.stdout;

	/**
	 * Buffer for processed input tokens.
	 * @type {[string|null]}
	 */
	var tokenCache = [];
	/**
	 * Buffer for raw input lines.
	 * @type {[string]}
	 */
	var lineCache = [];
	var leftoverData = "";
	var streamHasEnded = false;
	var MODE_READ_LINE = 0;
	var MODE_READ_TOKEN = 1;
	var currentReadMode = MODE_READ_TOKEN;

	/**
	 * Writes a given string to the output stream.
	 * @param {string} textString
	 * @param {string} [terminatorChar]
	 */
	function produceOutput (textString, terminatorChar) {
		outputStream.write(textString + (undefined === terminatorChar ? systemUtilities.EOL : terminatorChar));
	}
	function *fetchInput () {
		if ( 0 < lineCache.length ) {
			return lineCache.shift();
		} else {
			currentReadMode = MODE_READ_LINE;
			/**
			 * The line retrieved from the input.
			 * @type {string}
			 */
			var fetchedLine = yield;
			currentReadMode = MODE_READ_TOKEN;
			return fetchedLine;
		}
	}

	var mainGeneratorInstance = primaryHandler(produceOutput, fetchInput);

	/**
	 * Handles an incoming segment of data from the input stream.
	 * @param {string|null} dataBlock
	 */
	function processIncomingData (dataBlock) {
		inputStream.pause();
		if ( null === dataBlock ) {
			lineCache.push(null);
		} else {
			leftoverData += dataBlock;
			var lineExtractionPattern = /.*(\r?\n|\r)/g;
			var currentLineMatch, lastProcessedIndex = 0;
			while ( null !== (currentLineMatch = lineExtractionPattern.exec(leftoverData)) ) {
				lastProcessedIndex = lineExtractionPattern.lastIndex;
				lineCache.push(currentLineMatch[0]);
			}
			leftoverData = leftoverData.substring(lastProcessedIndex);
		}
		executeProcessingCycle();
	}

	function executeProcessingCycle () {
		while ( 0 < lineCache.length ) {
			switch ( currentReadMode ) {
				case MODE_READ_LINE:
				{
					tokenCache.push(lineCache.shift());
				}
				break;
				case MODE_READ_TOKEN:
				{
					if ( null === lineCache[0] ) {
						tokenCache.push(lineCache.shift());
					} else {
						var tokenExtractionPattern = /[^\s]+/g;
						var currentTokenMatch;
						if ( null !== (currentTokenMatch = tokenExtractionPattern.exec(lineCache[0])) ) {
							tokenCache.push(currentTokenMatch[0]);
							lineCache[0] = lineCache[0].substring(tokenExtractionPattern.lastIndex);
						} else {
							lineCache.shift();
						}
					}
				}
				break;
			}

			while ( 0 < tokenCache.length ) {
				var generatorOutcome = mainGeneratorInstance.next(tokenCache.shift());
				if ( undefined !== generatorOutcome.value ) {
					if ( 'string' === typeof generatorOutcome.value ) {
						produceOutput(generatorOutcome.value, "");
					} else {
						produceOutput(`${generatorOutcome.value}`, "");
					}
				}
				if ( generatorOutcome.done ) return;
			}
		}

		streamHasEnded ? setTimeout(processIncomingData, 0, null) : inputStream.resume();
	}
	inputStream.on('data', processIncomingData);
	inputStream.on('end', function () {
		streamHasEnded = true;
		processIncomingData(null);
	});

	inputStream.setEncoding('utf8');
	processIncomingData(null);
};

var systemUtilities = require('os');