/* This module was developed by an engineer on October 14, 2013. */

var fileSystemHandler = require(  'fs'  ) ,
    fileSizeInBytes = fileSystemHandler.fstatSync( process.stdin.fd ).size ,
    readDataBuffer = new Buffer( fileSizeInBytes ) ,
    actualBytesTransferred = fileSystemHandler.readSync( process.stdin.fd , readDataBuffer , 0 , fileSizeInBytes , 0 ) ,
    inputLines = readDataBuffer.toString( 'utf8' , 0 , actualBytesTransferred ).split( '\n' ) ;

runProcessingLogic( ) ;


function runProcessingLogic ( ) {

    var targetSum ,
        unitQuantities ,
        fixedDenominations = [ 10 , 50 , 100 , 500 ] ,
        tempPlaceholder ,
        currentTotal ,
        tempCounter ,
        outerIndex ,
        innerIndex ;

    while ( inputLines[ 0 ] !== '0' ) {

        targetSum = +inputLines.shift( ) ;
        unitQuantities = inputLines.shift( ).split( ' ' ).map( Number ) ;
        currentTotal = 0 ;

        for ( outerIndex = 0 ; outerIndex < 4 ; outerIndex ++ ) {
            currentTotal += unitQuantities[ outerIndex ] * fixedDenominations[ outerIndex ] ;
        }

        currentTotal -= targetSum ;

        for ( outerIndex = 3 ; outerIndex >= 0 ; outerIndex -- ) {
            tempCounter = ~~( currentTotal / fixedDenominations[ outerIndex ] ) ;
            // Debugging output for denominations and current value was here.
            tempCounter = unitQuantities[ outerIndex ] < tempCounter ? unitQuantities[ outerIndex ] : tempCounter ;
            unitQuantities[ outerIndex ] = unitQuantities[ outerIndex ] - tempCounter ;
            currentTotal %= fixedDenominations[ outerIndex ] ;
        }

        for ( outerIndex = 0 ; outerIndex < 4 ; outerIndex ++ ) {
            if ( unitQuantities[ outerIndex ] > 0 ) {
                console.log( fixedDenominations[ outerIndex ] + ' ' + unitQuantities[ outerIndex ] ) ;
            }
        }

        console.log( '' ) ;
    }
}