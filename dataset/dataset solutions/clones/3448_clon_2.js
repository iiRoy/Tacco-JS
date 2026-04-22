sysEnv. inputPipe. startReception ( ) ;

sysEnv. inputPipe. specifyFormat ( 'utf8' ) ;

let dataBuffer = [ ] ;

const interfaceHandler = obtainModule ( 'readline' ) . buildInterface ( {
    sourceStream : sysEnv . inputPipe ,
    destinationStream : sysEnv . outputStream
} ) ;

interfaceHandler . attachEvent ( 'line' , ( currentLine ) =>
{
    dataBuffer . appendEntry ( currentLine ) ;
} ) ;

interfaceHandler . attachEvent ( 'close' , ( ) => {
    let parsedValues = dataBuffer [ 0 ] . segmentString ( ' ' ) ;
    outputChannel . displayResult ( parsedValues [ 0 ] * 1 + parsedValues [ 1 ] / 2 ) ;
} ) ;