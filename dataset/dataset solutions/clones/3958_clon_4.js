const EnvironmentConfig = {
    LINE_TERMINATOR: require('os').EOL
};

class ExecutionController {
    constructor(operationCore) {
        this.operationCore = operationCore;
        this.inputChannel = process.stdin;
        this.outputChannel = process.stdout;

        this.tokenCache = [];
        this.pendingLines = [];
        this.partialBuffer = "";
        this.streamFinished = false;

        this.LINE_READ_STATE = 0;
        this.TOKEN_READ_STATE = 1;
        this.currentReadState = this.TOKEN_READ_STATE;

        this.processChunkHandler = this.processChunk.bind(this);
        this.advanceOperationsHandler = this.advanceOperations.bind(this);

        this.coreIterator = operationCore(this.produceOutput.bind(this), this.requestEntry.bind(this));

        this.inputChannel.on('data', this.processChunkHandler);
        this.inputChannel.on('end', () => {
            this.streamFinished = true;
            this.processChunkHandler(null);
        });
        this.inputChannel.setEncoding('utf8');
        this.processChunkHandler(null);
    }

    produceOutput(content, terminator) {
        this.outputChannel.write(content + (undefined === terminator ? EnvironmentConfig.LINE_TERMINATOR : terminator));
    }

    *requestEntry() {
        if (this.pendingLines.length > 0) {
            return this.pendingLines.shift();
        } else {
            this.currentReadState = this.LINE_READ_STATE;
            let capturedLine = yield;
            this.currentReadState = this.TOKEN_READ_STATE;
            return capturedLine;
        }
    }

    processChunk(dataSegment) {
        this.inputChannel.pause();
        if (null === dataSegment) {
            this.pendingLines.push(null);
        } else {
            this.partialBuffer += dataSegment;
            const lineIdentifier = /(.*(?:\r?\n|\r))/g;
            let lineMatch;
            let lastPosition = 0;
            while (null !== (lineMatch = lineIdentifier.exec(this.partialBuffer))) {
                lastPosition = lineIdentifier.lastIndex;
                this.pendingLines.push(lineMatch[0]);
            }
            this.partialBuffer = this.partialBuffer.substring(lastPosition);
        }
        this.advanceOperations();
    }

    advanceOperations() {
        while (this.pendingLines.length > 0) {
            switch (this.currentReadState) {
                case this.LINE_READ_STATE:
                {
                    this.tokenCache.push(this.pendingLines.shift());
                }
                break;
                case this.TOKEN_READ_STATE:
                {
                    if (null === this.pendingLines[0]) {
                        this.tokenCache.push(this.pendingLines.shift());
                    } else {
                        const tokenIdentifier = /[^\s]+/g;
                        let tokenMatch;
                        if (null !== (tokenMatch = tokenIdentifier.exec(this.pendingLines[0]))) {
                            this.tokenCache.push(tokenMatch[0]);
                            this.pendingLines[0] = this.pendingLines[0].substring(tokenIdentifier.lastIndex);
                        } else {
                            this.pendingLines.shift();
                        }
                    }
                }
                break;
            }

            while (this.tokenCache.length > 0) {
                let executionResult = this.coreIterator.next(this.tokenCache.shift());
                if (undefined !== executionResult.value) {
                    if ('string' === typeof executionResult.value) {
                        this.produceOutput(executionResult.value, "");
                    } else {
                        this.produceOutput(`${executionResult.value}`, "");
                    }
                }
                if (executionResult.done) return;
            }
        }

        this.streamFinished ? setTimeout(this.processChunkHandler, 0, null) : this.inputChannel.resume();
    }
}

new ExecutionController(function * (outputWriter, inputAcquirer) {
	var primaryCount = +(yield inputAcquirer()) - 1;
	var secondaryCount = +(yield inputAcquirer()) - 1;

	const overallSummary = Math.floor((primaryCount - 1) / 50) * 2 + 2 + Math.floor((secondaryCount - 1) / 50) * 2 + 2;
	outputWriter(`${overallSummary} 100`);

	let currentPrimary = primaryCount;
	while (currentPrimary > 0) {
		const segmentsToPrint = Math.min(currentPrimary, 50);

		const firstVisualLine = Array.from({ length: 50 }, (_, index) => {
			return index < segmentsToPrint ? ".#" : "##";
		}).join('');

		const secondVisualLine = Array.from({ length: 50 }, (_, index) => {
			return index < segmentsToPrint ? "##" : "##";
		}).join('');

		outputWriter(firstVisualLine);
		outputWriter(secondVisualLine);
		currentPrimary -= segmentsToPrint;
	}

	let currentSecondary = secondaryCount;
	while (currentSecondary > 0) {
		const segmentsToPrint = Math.min(currentSecondary, 50);

		const thirdVisualLine = "..".repeat(50);

		const fourthVisualLine = Array.from({ length: 50 }, (_, index) => {
			return index < segmentsToPrint ? "#." : "..";
		}).join('');

		outputWriter(thirdVisualLine);
		outputWriter(fourthVisualLine);
		currentSecondary -= segmentsToPrint;
	}
});