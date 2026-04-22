`inputData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( "\n" ) ;

inputData . sort ( function ( elemOne , elemTwo )
{
    return elemTwo - elemOne ;
} ) ;

console . log (
    ( inputData[0] * 10 - inputData[ inputData.length - 1 ] * 10 ) / 10
) ;`