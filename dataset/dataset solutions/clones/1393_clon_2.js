( function ( inputDataLine ) {
    // This block processes a single line of input for arithmetic calculations.
    const componentStrings = inputDataLine . split ( ' ' ) ;

    const firstOperand = parseFloat ( componentStrings [ 0 ] ) ;
    const secondOperand = parseFloat ( componentStrings [ 1 ] ) ;

    console.log (
        Math.floor ( firstOperand / secondOperand ) +
        ' ' +
        firstOperand % secondOperand +
        ' ' +
        ( firstOperand / secondOperand ) . toFixed ( 6 )
    ) ;
} (
    require ( 'fs' )
        . readFileSync ( '/dev/stdin' , 'utf8' )
) ) ;