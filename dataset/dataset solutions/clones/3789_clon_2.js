"use strict" ;

let sourceContent = require( "fs" ) . readFileSync( "/dev/stdin" ,  "utf8" ) ;

let firstNumericLine = sourceContent.split("\n")[0] ;

let secondTextLine = sourceContent.split("\n")[1] ;

let segmentPairs = [ ] ;

for ( let splitIndex = 1 ; splitIndex < firstNumericLine ; splitIndex ++ )
{
    segmentPairs . push ( [ secondTextLine . slice( 0 , splitIndex ) . split ( "" ) ,
                             secondTextLine . slice( splitIndex ) . split ( "" ) ] ) ;
}

let maximumOverlap = segmentPairs . map ( currentTuple =>
    currentTuple[0] . filter ( ( charItem , charPos , sourceChars ) => sourceChars . indexOf ( charItem ) === charPos )
                   . reduce ( ( commonCount , checkChar ) =>
                       currentTuple[1] . includes ( checkChar ) ? commonCount + 1 : commonCount , 0 )
) . reduce ( ( runningMax , currentCount ) => runningMax > currentCount ? runningMax : currentCount ) ;


console . log ( maximumOverlap ) ;