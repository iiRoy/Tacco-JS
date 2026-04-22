"use strict" ;

let   inputContent = require  (  "fs"  ) . readFileSync  (  "/dev/stdin"  ,  "utf8"  ) . trim (  ) ;

let limitValue = parseInt (  inputContent . split (  '\n'  ) [  0  ]  ,  10  ) ;


let dataValues = inputContent
    .split ( '\n' ) [ 1 ]
    .split ( ' ' )
    .map ( valStr => parseInt ( valStr , 10 ) ) ;


let elementTallies = ( new Array ( limitValue ) ) . fill ( 0 ) ;

for
(
    let loopCounter = 0 ;
    loopCounter < limitValue ;
    loopCounter ++
)
{
    elementTallies [ dataValues [ loopCounter ] - 1 ] ++ ;
}


let totalCombinations = 0 ;

elementTallies . forEach ( occurrenceCount =>
    {
        if ( occurrenceCount >= 2 )
        {
            totalCombinations += occurrenceCount * ( occurrenceCount - 1 ) / 2 ;
        }
    }
) ;


dataValues . forEach ( currentItem =>
    {
        console . log ( totalCombinations - elementTallies [ currentItem - 1 ] + 1 ) ;
    }
) ;