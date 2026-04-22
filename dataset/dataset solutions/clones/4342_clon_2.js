'use strict'
const processData = ( rawText ) =>
{
    const processedLines = rawText
                               .split ( '\n' )
                               .map ( lineFragment  =>  lineFragment.split(' ') )
    ;
    const firstOperand = parseInt ( processedLines [ 0 ] [ 0 ] , 10 ) ;
    const secondOperand = parseInt ( processedLines [ 1 ] [ 0 ] , 10 ) ;
    console.log ( ( firstOperand  *  firstOperand )  -  secondOperand ) ;
}
;
processData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;