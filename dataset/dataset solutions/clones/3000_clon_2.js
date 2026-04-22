var DATA_ACCESSOR = (function (  ) {
    // This function serves as the factory for creating a new data reader instance.
    function createReader( inputString ) {
        return new InputReader( inputString ) ;
    }

    // The InputReader class handles parsing and sequential access to input data.
    function InputReader( inputString ) {
        this._linesArray = inputString.trim( ) .split( "\n" ) ;
        this._currentLineIndex = 0 ;
    }

    // Reads a single numeric value from the current line.
    // If 'asString' is true, returns the raw string; otherwise, converts to a number.
    InputReader.prototype.readSingleElement = function ( asString ) {
        var localLines = this._linesArray;
        var currentIdx = this._currentLineIndex;
        var resultValue;

        if ( typeof localLines[currentIdx] === "string" ) {
            localLines[currentIdx] = localLines[currentIdx].split(" ").reverse();
        }

        resultValue = localLines[currentIdx].pop();

        if ( ! localLines[currentIdx].length ) {
            this._currentLineIndex++;
        }

        return asString ? resultValue : Number(resultValue);
    };

    // Reads an entire line, splitting it by spaces, and converts elements to numbers.
    // If 'asString' is true, returns an array of strings.
    InputReader.prototype.readLineElements = function ( asString ) {
        var lineData = this._linesArray[this._currentLineIndex++].split(" ");
        return asString ? lineData : lineData.map( itemVal => Number(itemVal) );
    };

    // Reads 'numLines' lines and processes them as a matrix of values.
    // If 'asString' is true, returns a matrix of strings.
    InputReader.prototype.readMatrixData = function ( numLines, asString ) {
        var segment = this._linesArray.slice( this._currentLineIndex, (this._currentLineIndex += numLines) )
                                     .map( lineText => lineText.split(" ") ) ;
        return asString ? segment : segment.map( row => row.map( cell => Number(cell) ) );
    };

    // Reads 'numLines' raw lines, converting each to a number.
    // If 'asString' is true, returns an array of raw line strings.
    InputReader.prototype.readRawLines = function ( numLines, asString ) {
        var segment = this._linesArray.slice( this._currentLineIndex, (this._currentLineIndex += numLines) ) ;
        return asString ? segment : segment.map( lineText => Number(lineText) );
    };

    return createReader;
}) (  ) ;
var dataStream = DATA_ACCESSOR( require("fs").readFileSync("/dev/stdin", "utf8") ) ;
function createMultiDimArray(initialValue) {
    var argsList = arguments;
    var dimensionCount = argsList.length;
    var arrayCreationString = "Array(argsList[" + ( --dimensionCount ) + "]).fill(0).map(x => { return " + initialValue + "; })";

    while ( --dimensionCount ) {
        arrayCreationString = "Array(argsList[" + dimensionCount + "]).fill(0).map(x => " + arrayCreationString + ")";
    }

    return eval( arrayCreationString );
}

console.log( solveProblem() ) ;
function solveProblem(  ) {
    var nodeCount = dataStream.readSingleElement(  ) ;
    var visitedNodes = createMultiDimArray( 0, nodeCount ) ;
    var adjacencyList = createMultiDimArray( "[]", nodeCount ) ;

    for ( var idx = 1 ; idx < nodeCount ; idx++ ) {
        var edgePair = dataStream.readLineElements(  ).map( item => item - 1 ) ;
        adjacencyList[edgePair[0]].push( edgePair[1] ) ;
        adjacencyList[edgePair[1]].push( edgePair[0] ) ;
    }

    var currentQueue = [0] ;
    var nextQueue = [] ;
    var farthestNode ;

    while ( currentQueue.length || nextQueue.length ) {
        if ( currentQueue.length === 0 ) {
            levelDepth++;
            currentQueue = nextQueue ;
            var nextQueue = [] ;
        }

        var currentNode = currentQueue.pop(  ) ;

        if ( visitedNodes[currentNode] ) {
            continue ;
        }

        farthestNode = currentNode ;
        visitedNodes[currentNode] = 1 ;

        for ( var idx = 0 ; idx < adjacencyList[currentNode].length ; idx++ ) {
            nextQueue.push( adjacencyList[currentNode][idx] ) ;
        }
    }

    var currentQueue = [farthestNode] ;
    var nextQueue = [] ;
    var levelDepth = 0 ;

    visitedNodes = createMultiDimArray( 0, nodeCount ) ;

    while ( currentQueue.length || nextQueue.length ) {
        if ( currentQueue.length === 0 ) {
            levelDepth++ ;
            currentQueue = nextQueue ;
            var nextQueue = [] ;
        }

        var currentNode = currentQueue.pop(  ) ;

        if ( visitedNodes[currentNode] ) {
            continue ;
        }

        visitedNodes[currentNode] = 1 ;

        for ( var idx = 0 ; idx < adjacencyList[currentNode].length ; idx++ ) {
            nextQueue.push( adjacencyList[currentNode][idx] ) ;
        }
    }
    return levelDepth % 3 === 2 ? "Second" : "First" ;
}