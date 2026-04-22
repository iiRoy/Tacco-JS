function toInt( textString ) { return parseInt(textString); }

function toFloat( textString ) { return parseFloat(textString); }

Array.prototype.orderNumbersAscending = function ( ) {
    return this.sort( ( valA, valB ) => ( valA - valB ) );
};

Array.prototype.orderNumbersDescending = function ( ) {
    return this.sort( ( valA, valB ) => ( valB - valA ) );
};

Array.prototype.orderStringsAscending = function ( ) {
    return this.sort( );
};

Array.prototype.orderStringsDescending = function ( ) {
    return this.sort( ).reverse( );
};

Array.prototype.filterOut = function ( targetItem ) {
    return this.filter( ( currentElement ) => currentElement !== targetItem );
};


var rawData = '';

process.stdin.resume( );
process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'data', ( dataPortion ) => {
    rawData += dataPortion;
} );

process.stdin.on( 'end', ( ) => {
    let textLines = rawData.split( '\n' ).map( lineContent => lineContent.trim( ) );

    if ( textLines[ textLines.length - 1 ] === '' ) {
        textLines = textLines.slice( 0, -1 );
    }

    processInput( textLines );
} );


function processInput( textLines ) {
    var numericValues = textLines[0].split( ' ' ).map( toInt );
    var itemCount = numericValues[0];
    var maxWeight = numericValues[1];
    var currentMaxValue = 0;

    textLines = textLines.slice( 1 ).map( lineContent => lineContent.split( ' ' ).map( toInt ) );

    function exploreCombinations( currentIndex, accumulatedWeight, accumulatedValue ) {
        if ( currentIndex === itemCount ) {
            console.log( currentMaxValue );
            process.exit( );
        }

        for ( let loopIndex = currentIndex, limitIndex = itemCount; loopIndex < limitIndex; loopIndex++ ) {
            var itemWeight = textLines[loopIndex][0];
            var itemValue = textLines[loopIndex][1];

            if ( itemWeight + accumulatedWeight <= maxWeight ) {
                currentMaxValue = Math.max( currentMaxValue, itemValue + accumulatedValue );
                exploreCombinations( loopIndex + 1, itemWeight + accumulatedWeight, itemValue + accumulatedValue );
            }
        }
    }

    exploreCombinations( 0, 0, 0 );
    console.log( currentMaxValue );
}