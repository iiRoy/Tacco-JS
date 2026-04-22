var DATA_READER = ( function () {

    function createReader( inputString ) {
        return new StreamProcessor( inputString );
    }

    function StreamProcessor( rawData ) {
        this._sourceLines = rawData.trim().split( "\n" );
        this._currentLineIndex = 0;
    }

    StreamProcessor.prototype.getSingleValue = function ( asStringFlag ) {
        var lineBuffer = this._sourceLines;
        var lineIndex = this._currentLineIndex;
        var extractedItem;

        if ( typeof lineBuffer[lineIndex] === "string" ) {
            lineBuffer[lineIndex] = lineBuffer[lineIndex].split(" ").reverse();
        }

        extractedItem = lineBuffer[lineIndex].pop();

        if ( !lineBuffer[lineIndex].length ) {
            this._currentLineIndex++;
        }

        return asStringFlag ? extractedItem : +extractedItem;
    };

    StreamProcessor.prototype.getLineAsNumbers = function ( keepTextOutput ) {
        var currentLineContent = this._sourceLines[this._currentLineIndex++].split(" ");
        return keepTextOutput ? currentLineContent : currentLineContent.map( element => +element );
    };

    StreamProcessor.prototype.getMatrix = function ( rowsToRead, outputAsStrings ) {
        var segmentOfLines = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += rowsToRead ).map( textRow => textRow.split(" ") );
        return outputAsStrings ? segmentOfLines : segmentOfLines.map( rowElements => rowElements.map( itemValue => +itemValue ) );
    };

    StreamProcessor.prototype.getRawLines = function ( countOfRows, returnStrings ) {
        var resultingSection = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += countOfRows );
        return returnStrings ? resultingSection : resultingSection.map( numericString => +numericString );
    };

    return createReader;

})();


var inputHandler = DATA_READER( require("fs").readFileSync( "/dev/stdin", "utf8" ) );


console.log( solveProblem() );


function solveProblem() {

    var totalElements = inputHandler.getSingleValue();

    var inputNumbers = inputHandler.getLineAsNumbers();

    var numberFrequencies = {};

    var powersOfTwo = [ 2 ];

    inputNumbers.sort( ( valA, valB ) => valB - valA );

    var loopCounter;
    for ( loopCounter = 1; powersOfTwo[loopCounter - 1] <= inputNumbers[0]; loopCounter++ ) {
        powersOfTwo[loopCounter] = powersOfTwo[loopCounter - 1] * 2;
    }

    var currentPowerIdx = loopCounter - 1;

    for ( loopCounter = 0; loopCounter < totalElements; loopCounter++ ) {
        if ( numberFrequencies[inputNumbers[loopCounter]] ) {
            numberFrequencies[inputNumbers[loopCounter]]++;
        } else {
            numberFrequencies[inputNumbers[loopCounter]] = 1;
        }
    }

    var solutionCount = 0;

    for ( loopCounter = 0; loopCounter < totalElements; loopCounter++ ) {

        numberFrequencies[inputNumbers[loopCounter]]--;

        while ( currentPowerIdx > 0 && powersOfTwo[currentPowerIdx - 1] >= inputNumbers[loopCounter] ) {
            currentPowerIdx--;
        }

        var targetComplement = powersOfTwo[currentPowerIdx] - inputNumbers[loopCounter];

        if ( numberFrequencies[targetComplement] > 0 ) {
            numberFrequencies[targetComplement]--;
            solutionCount++;
        }
    }

    return solutionCount;
}