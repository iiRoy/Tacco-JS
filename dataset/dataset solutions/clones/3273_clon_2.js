var inputProvider = setupInputReader( );


runApplicationLogic();


function retrieveNextInteger() {
    return performDataTransformation( fetchNextLine(), 1 );
}


function retrieveNextStringArray ( ) {
    return performDataTransformation( fetchNextLine(), 2 );
}


function retrieveNextIntegerArray ( ) {
    return performDataTransformation( fetchNextLine(), 4 );
}


function retrieveNextCharacterArray ( ) {
    return performDataTransformation( fetchNextLine(), 6 );
}


function fetchNextLine ( ) {
    return inputProvider.fetchNextLine();
}


function hasMoreData ( ) {
    return inputProvider.hasMoreData();
}


function readStandardInput ( ) {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}


function setupInputReader ( ) {
    var incomingLines = readStandardInput();

    var readerInstance = {
        "lineStorage" : incomingLines,
        "currentLineIndex" : 0,
        "totalLineCount" : incomingLines.length,

        "hasMoreData" : function ( ) {
            return ( this.currentLineIndex < this.totalLineCount );
        },

        "fetchNextLine" : function ( ) {
            if ( !this.hasMoreData() ) {
                return "";
            } else {
                var processedLine = this.lineStorage[ this.currentLineIndex ];
                this.currentLineIndex++;
                return processedLine;
            }
        }
    };

    return readerInstance;
}


function displayResult ( outputValue ) {
    console.log( outputValue );
}


function logErrorToConsole ( errorMessage ) {
    console.error( errorMessage );
}


function performDataTransformation ( inputData, conversionCode ) {
    try {
        switch ( conversionCode ) {
            case 1:
                return parseInt( inputData );
            case 2:
                return inputData.split(" ");
            case 4:
                return inputData.split(" ").map( ( element ) => Number( element ) );
            case 6:
                return inputData.split("");
            case 7:
                return inputData.split("").map( ( element ) => Number( element ) );
            case 8:
                return inputData.join(" ");
            case 9:
                return inputData.join("\n");
            case 0:
                return inputData.join("");
            default:
                return inputData;
        }
    } catch ( caughtException ) {
        return inputData;
    }
}


function runApplicationLogic ( ) {

    var totalElements = retrieveNextInteger();
    var firstCollection = retrieveNextIntegerArray();
    var secondCollection = retrieveNextIntegerArray();

    var positiveDifferenceValues = [];
    var sumOfDeficits = 0;
    var overallDifferenceSum = 0;
    var finalCount = 0;

    for ( var loopIndex = 0; loopIndex < totalElements; loopIndex++ ) {
        overallDifferenceSum += firstCollection[ loopIndex ] - secondCollection[ loopIndex ];

        if ( firstCollection[ loopIndex ] - secondCollection[ loopIndex ] >= 0 ) {
            positiveDifferenceValues.push( firstCollection[ loopIndex ] - secondCollection[ loopIndex ] );
        } else {
            sumOfDeficits += secondCollection[ loopIndex ] - firstCollection[ loopIndex ];
            finalCount++;
        }
    }

    if ( overallDifferenceSum < 0 ) {
        displayResult( -1 );
    } else {
        positiveDifferenceValues.sort( function ( valueA, valueB ) {
            return valueB - valueA;
        });

        for ( var loopIndex = 0; loopIndex < positiveDifferenceValues.length; loopIndex++ ) {
            if ( sumOfDeficits <= 0 ) {
                break;
            }
            sumOfDeficits -= positiveDifferenceValues[ loopIndex ];
            finalCount++;
        }

        displayResult( finalCount );
    }
}