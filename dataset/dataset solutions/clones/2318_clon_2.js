"use strict"
const   PerformCalculation   =  (   initialString  )  =>
{
    let   stringArray   =   initialString . trim ( ) . split ( '\n' ) ;

    const   valueComparator   =   (   elementA  ,  elementB   )  =>
    {
        return   elementA   -   elementB  ;
    }

    stringArray . sort (   valueComparator   ) ;

    if  (   stringArray [ 0 ]   ==   1   &&   stringArray [ 1 ]   ==   2   )
    {
        console . log ( 3 ) ;
    }
    else if   (   stringArray [ 0 ]   ==   2   &&   stringArray [ 1 ]   ==   3   )
    {
        console . log ( 1 ) ;
    }
    else
    {
        console . log ( 2 ) ;
    }
};

PerformCalculation( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;