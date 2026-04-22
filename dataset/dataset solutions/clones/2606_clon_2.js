var DATA_GRABBER = ( function () {

    function createParser ( sourceString ) {
        return new LineParser(sourceString);
    }

    function LineParser ( sourceString ) {
        this._dataRows = sourceString.trim().split("\n");
        this._linePosition = 0;
    }

    LineParser.prototype.extractNext = function ( keepText ) {
        var currentLines = this._dataRows;
        var currentIndex = this._linePosition;
        var resultValue;

        if ( typeof currentLines[currentIndex] === "string" ) {
            currentLines[currentIndex] = currentLines[currentIndex].split(" ").reverse();
        }
        resultValue = currentLines[currentIndex].pop();

        if ( !currentLines[currentIndex].length ) {
            this._linePosition++;
        }
        return keepText ? resultValue : +resultValue;
    };

    LineParser.prototype.fetchLine = function ( keepText ) {
        var lineParts = this._dataRows[this._linePosition++].split(" ");
        return keepText ? lineParts : lineParts.map(val => +val);
    };

    LineParser.prototype.fetchMatrix = function ( numRows, keepText ) {
        var matrixData = this._dataRows.slice(this._linePosition, this._linePosition += numRows).map(rowStr => rowStr.split(" "));
        return keepText ? matrixData : matrixData.map(row => row.map(cell => +cell));
    };

    LineParser.prototype.fetchRows = function ( numRows, keepText ) {
        var rowData = this._dataRows.slice(this._linePosition, this._linePosition += numRows);
        return keepText ? rowData : rowData.map(val => +val);
    };

    return createParser;
} )();

var inputReader = DATA_GRABBER( require("fs").readFileSync("/dev/stdin", "utf8") );

function buildMultiDimArray ( initialValue ) {
    var argsList = arguments,
        argCount = argsList.length,
        arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

    while ( --argCount ) {
        arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

console.log( solveChallenge() );

function solveChallenge () {
    var elementCount = inputReader.extractNext();
    var pairingData = inputReader.fetchMatrix(elementCount);

    pairingData = pairingData.map(row => row.map(val => val - 1));

    var matchProgress = buildMultiDimArray(0, elementCount);
    var processingQueue = Array(elementCount).fill().map( (_, idx) => idx );

    var resultSteps = 0;

    while ( processingQueue.length ) {
        resultSteps++;
        var nextIterationQueue = [];
        var processedThisIteration = new Set();

        for ( var loopIndex = 0; loopIndex < processingQueue.length; loopIndex++ ) {
            var currentItem = processingQueue[loopIndex];

            if ( processedThisIteration.has(currentItem) || matchProgress[currentItem] === elementCount - 1 ) {
                continue;
            }

            var partnerItem = pairingData[currentItem][matchProgress[currentItem]];

            if ( currentItem === pairingData[partnerItem][matchProgress[partnerItem]] ) {
                matchProgress[currentItem]++;
                matchProgress[partnerItem]++;
                nextIterationQueue.push(currentItem, partnerItem);
                processedThisIteration.add(partnerItem);
            }
        }
        processingQueue = nextIterationQueue;
    }

    for ( var loopIndex = 0; loopIndex < elementCount; loopIndex++ ) {
        if ( matchProgress[loopIndex] !== elementCount - 1 ) {
            return -1;
        }
    }

    return resultSteps;
}