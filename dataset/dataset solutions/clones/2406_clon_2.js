process.stdin.resume( ) ;

process.stdin.setEncoding ( 'utf-8' ) ;


let receivedSegments = [ ] ;

let lineProcessor = require ( 'readline' ) .createInterface (
    {
        input : process.stdin,

        output : process.stdout
    }
);


lineProcessor.on ( 'line' , ( currentTextLine ) => {
    receivedSegments = currentTextLine.split ( ' ' ) ;
} ) ;


let firstValue = receivedSegments [ 0 ] ;

let secondValue = receivedSegments [ 1 ] ;


if ( firstValue === 1 && secondValue === 1 )
{
    lineProcessor.on ( 'close' , ( ) => {
        console.log ( 300000 * 2 + 400000 ) ;
    } ) ;
}
else
{
    lineProcessor.on ( 'close' , ( ) => {
        console.log ( 100000 * ( ( 4 - firstValue ) + ( 4 - secondValue ) ) ) ;
    } ) ;
}