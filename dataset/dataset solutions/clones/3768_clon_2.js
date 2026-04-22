function Processor( rawData )
{
    let tokenArray =   [ ];
    tokenArray = rawData  . split ( ' ' );
    let firstNum = tokenArray[ 0 ];
    let secondNum = tokenArray[ 1 ];
    let differenceCounter = secondNum - firstNum;
    let cumulativeSum = 1;

    for ( differenceCounter = 1 ; differenceCounter <= 999 ; differenceCounter++ )
    {
        cumulativeSum = differenceCounter ;
    }
    console.log ( cumulativeSum - firstNum ) ;
}
Processor( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;