var DATA_PARSER = ( function() {
    function createParser( inputString ) {
        return new StreamProcessor( inputString );
    }

    function StreamProcessor( inputString ) {
        this._sourceLines = inputString.trim().split( '\n' );
        this._currentLineIndex = 0;
    }

    StreamProcessor.prototype.extractValue = function( convertToInt ) {
        var linesArray = this._sourceLines,
            currentIndex = this._currentLineIndex,
            extractedResult;

        if ( typeof linesArray[ currentIndex ] === 'string' ) {
            linesArray[ currentIndex ] = linesArray[ currentIndex ].split( ' ' ).reverse();
        }

        extractedResult = linesArray[ currentIndex ].pop();

        if ( !linesArray[ currentIndex ].length ) {
            this._currentLineIndex++;
        }

        return convertToInt ? extractedResult : +extractedResult;
    };

    StreamProcessor.prototype.readLineValues = function( keepAsString ) {
        var currentLineParts = this._sourceLines[ this._currentLineIndex++ ].split( ' ' );
        return keepAsString ? currentLineParts : currentLineParts.map( numericVal => +numericVal );
    };

    StreamProcessor.prototype.readMatrix = function( numRows, retainStrings ) {
        var resultMatrix = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += numRows ).map( rowString => rowString.split( ' ' ) );
        return retainStrings ? resultMatrix : resultMatrix.map( rowArray => rowArray.map( cellVal => +cellVal ) );
    };

    StreamProcessor.prototype.readLines = function( lineCount, asStrings ) {
        var lineResults = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += lineCount );
        return asStrings ? lineResults : lineResults.map( lineContent => +lineContent );
    };

    return createParser;
} )();

var inputProcessor = DATA_PARSER( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) );

function multiDimArray( initialValue ) {
    var argsList = arguments,
        argCount = argsList.length,
        arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map( _ => { return " + initialValue + "; } )";

    while ( --argCount ) {
        arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map( _ => " + arrayCreationString + " )";
    }

    return eval( arrayCreationString );
}

const PRIME_MODULUS = 1_000_000_007;

function multiplyModulo() {
    var factors = arguments,
        productAccumulator = factors[ 0 ],
        factorIndex = 1;

    while ( factorIndex < factors.length ) {
        productAccumulator = ( ( productAccumulator >> 16 ) * factors[ factorIndex ] % PRIME_MODULUS * 65536 + ( productAccumulator & 65535 ) * factors[ factorIndex++ ] ) % PRIME_MODULUS;
    }

    return productAccumulator;
}

var factorialsCache = [ 1, 1 ];

function getFactorialModulo( value ) {
    for ( var currentNum = factorialsCache.length; currentNum <= value; currentNum++ ) {
        factorialsCache[ currentNum ] = multiplyModulo( factorialsCache[ currentNum - 1 ], currentNum );
    }

    return factorialsCache[ value ];
}

function combinationsModulo( totalItems, chosenItems ) {
    return multiplyModulo( getFactorialModulo( totalItems ), modularInverse( getFactorialModulo( chosenItems ) ), modularInverse( getFactorialModulo( totalItems - chosenItems ) ) );
}

function modularInverse( num ) {
    var modVal = PRIME_MODULUS,
        inverseU = 1,
        inverseV = 0,
        tempVar;

    while ( modVal ) {
        tempVar = num / modVal | 0;
        num -= tempVar * modVal;
        inverseU -= tempVar * inverseV;
        tempVar = num;
        num = modVal;
        modVal = tempVar;
        tempVar = inverseU;
        inverseU = inverseV;
        inverseV = tempVar;
    }

    inverseU %= PRIME_MODULUS;
    return inverseU < 0 ? inverseU + PRIME_MODULUS : inverseU;
}

console.log( calculateResult() );

function calculateResult() {
    var dimensionN = inputProcessor.extractValue();
    var dimensionM = inputProcessor.extractValue();
    var parameterK = inputProcessor.extractValue();
    var gridData = multiDimArray( 0, dimensionN, dimensionM );

    for ( var colIdx = 0; colIdx < dimensionM; colIdx++ ) {
        for ( var rowIdx = 0; rowIdx < dimensionN; rowIdx++ ) {
            gridData[ rowIdx ][ colIdx ] = ( sumUpToMinusOne( colIdx + 1 ) + sumUpToMinusOne( dimensionM - colIdx ) ) * dimensionN;
            gridData[ rowIdx ][ colIdx ] += ( sumUpToMinusOne( rowIdx + 1 ) + sumUpToMinusOne( dimensionN - rowIdx ) ) * dimensionM;
        }
    }

    var finalSum = 0;
    for ( var colIdx = 0; colIdx < dimensionM; colIdx++ ) {
        for ( var rowIdx = 0; rowIdx < dimensionN; rowIdx++ ) {
            finalSum += gridData[ rowIdx ][ colIdx ];
        }
    }

    finalSum %= PRIME_MODULUS;

    return multiplyModulo( finalSum, combinationsModulo( dimensionN * dimensionM - 2, parameterK - 2 ), modularInverse( 2 ) );
}

function sumUpToMinusOne( inputVal ) {
    return inputVal * ( inputVal - 1 ) / 2;
}