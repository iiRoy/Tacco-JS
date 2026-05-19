var InputProcessorFactory = (function() {
    function createInputProcessor(rawTextContent) {
        return new InputProcessor(rawTextContent);
    }

    function InputProcessor(rawTextContent) {
        this._sourceLines = rawTextContent.trim().split("\n");
        this._currentLineIndex = 0;
        this._currentLineWords = [];
        this._currentWordIndex = 0;
    }

    InputProcessor.prototype.getNextAtom = function(returnAsString) {
        if (this._currentWordIndex >= this._currentLineWords.length) {
            if (this._currentLineIndex >= this._sourceLines.length) {
                return undefined;
            }
            const lineContent = this._sourceLines[this._currentLineIndex];
            this._currentLineWords = lineContent.split(" ");
            this._currentWordIndex = 0;
            this._currentLineIndex++;
        }

        const atomValue = this._currentLineWords[this._currentWordIndex];
        this._currentWordIndex++;

        return returnAsString ? atomValue : +atomValue;
    };

    InputProcessor.prototype.getNextLine = function(returnAsStrings) {
        if (this._currentLineIndex >= this._sourceLines.length) {
            return undefined;
        }
        this._currentLineWords = [];
        this._currentWordIndex = 0;

        const lineContent = this._sourceLines[this._currentLineIndex++];
        const words = lineContent.split(" ");
        return returnAsStrings ? words : words.map(val => +val);
    };

    InputProcessor.prototype.getMatrix = function(rowCount, returnAsStrings) {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            resultMatrix.push(this.getNextLine(returnAsStrings));
        }
        return resultMatrix;
    };

    InputProcessor.prototype.getRawLines = function(count, returnAsStrings) {
        const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + count);
        this._currentLineIndex += count;
        return returnAsStrings ? lines : lines.map(val => +val);
    };

    return createInputProcessor;
})();

var inputHandler = InputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiArray(initialValue, ...dimensions) {
    const [currentDimensionSize, ...remainingDimensions] = dimensions;

    if (currentDimensionSize === undefined) {
        return initialValue;
    }

    return Array.from({ length: currentDimensionSize }, () =>
        initializeMultiArray(initialValue, ...remainingDimensions)
    );
}

console.log(determineOptimalExclusion());

function determineOptimalExclusion() {
    const inputSequence = inputHandler.getNextAtom(true);
    const sequenceLength = inputSequence.length;

    let minimumMaxSegment = sequenceLength;

    Array.from({ length: 26 }, (_, charCodeOffset) => String.fromCharCode(97 + charCodeOffset))
        .forEach(charToExclude => {
            const segments = inputSequence.split(charToExclude);

            const maxSegmentLength = segments.reduce((currentMax, segment) =>
                Math.max(currentMax, segment.length), 0);

            if (maxSegmentLength < minimumMaxSegment) {
                minimumMaxSegment = maxSegmentLength;
            }
        });

    return minimumMaxSegment;
}
