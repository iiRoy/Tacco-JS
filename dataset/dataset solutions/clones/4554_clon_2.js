"use strict";


const   computeResult   =   ( inputData )   =>
{
    inputData = inputData.trim() . split ( "\n" ) ;

    const   itemCount   =   parseInt ( inputData[0] . split ( " " ) [0] ) ;
    const   firstParam  =   parseInt ( inputData[0] . split ( " " ) [1] ) ;
    const   secondParam =   parseInt ( inputData[0] . split ( " " ) [2] ) ;


    const   upperLimit  =   firstParam  +   ( secondParam  *  ( itemCount   -   1 ) ) ;
    const   lowerLimit  =   secondParam +   ( firstParam   *  ( itemCount   -   1 ) ) ;


    let finalOutput =   upperLimit  -   lowerLimit  +   1   ;


    if  ( firstParam  >   secondParam )
    {
        finalOutput =   0   ;
    }
    else    if  ( itemCount   === 1 )
    {
        finalOutput =   ( firstParam  === secondParam )   ?   1   :   0   ;
    }


    console.log( finalOutput )  ;
} ;


computeResult ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;