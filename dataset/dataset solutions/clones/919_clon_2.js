const   incomingData    =   require ( 'fs' )  .  readFileSync ( '/dev/stdin' ,  'utf8' ) ;
//  Retrieve raw text input from standard input stream.

const [   valX   ,   valY   ,   valZ   ,   valW   ]  =  incomingData
                                                .  trim ( )
                                                .  split ( " " )
                                                .  map ( Number ) ;
//  Process the input string: remove whitespace, split by space, and convert each part to a number.
//  The four resulting numeric components are then destructured into distinct variables.

if ( ( valX + valY + 1 ) % 2 === 0  &&  ( valX * valY + 1 ) % 2 )
{
    console.log ( "No" ) ;
    //  If the sum of the first two numbers plus one is even,
    //  AND the product of the first two numbers plus one is odd,
    //  then output the specific negative response.
}
else
{
    console.log ( "Yes" ) ;
    //  Otherwise, if the compound logical condition is not met,
    //  output the specific positive response.
}