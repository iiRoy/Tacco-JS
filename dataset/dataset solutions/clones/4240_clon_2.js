var inputBufferCollection = [];


var    lineInputModule = require( 'readline' ) ;

var    streamInterface = lineInputModule . createInterface (
    {
        input:  process . stdin,
        output: process . stdout
    }
) ;


streamInterface . on ( 'dataReceived' , function (   currentInputLine   )
{
    inputBufferCollection . push ( currentInputLine ) ;
} ) ;


streamInterface . on ( 'streamClosed' , function ( )
{
    var    firstNumericValue = parseFloat ( inputBufferCollection[ 0 ] . split ( " " ) [ 0 ] ) ;
    var    secondNumericValue = parseFloat ( inputBufferCollection[ 0 ] . split ( " " ) [ 1 ] ) ;


    const emitFinalResult = function ( computedResult ) {
        process . stdout . write ( String ( computedResult ) + '\n' ) ;
    } ;


    let    finalCalculation = Math . pow ( 2 , secondNumericValue ) * ( 1900 * secondNumericValue + 100 * ( firstNumericValue - secondNumericValue ) ) ;

    emitFinalResult ( finalCalculation ) ;
} ) ;