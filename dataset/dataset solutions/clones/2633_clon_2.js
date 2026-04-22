const stringToIntegerConverter = ( inputString ) => Number . parseInt ( inputString, 10 ) ;


const stringArrayToIntegerArray = ( stringCollection ) => stringCollection . map ( ( currentStringElement ) => stringToIntegerConverter( currentStringElement ) ) ;


const calculateAbsoluteValue = ( numericInput ) => ( numericInput > 0 ) ? numericInput : - numericInput ;


function determineMinimum ( ) {
    let inputValues = arguments;
    let minimumFound = inputValues [ 0 ];
    for ( let loopIndexForMin = 1 ; loopIndexForMin < inputValues . length ; loopIndexForMin ++ )
    {
        if ( inputValues [ loopIndexForMin ] < minimumFound )
        {
            minimumFound = inputValues [ loopIndexForMin ];
        }
    }
    return minimumFound ;
}


function determineMaximum ( ) {
    let valueCollection = arguments ;
    let maximumFound = valueCollection [ 0 ] ;
    for ( let loopIndexForMax = 1 ; loopIndexForMax < valueCollection . length ; loopIndexForMax ++ )
    {
        if ( valueCollection [ loopIndexForMax ] > maximumFound )
        {
            maximumFound = valueCollection [ loopIndexForMax ] ;
        }
    }
    return maximumFound ;
}


function computeGreatestCommonDivisor ( ) {
    let numberArguments = arguments;
    let currentGcdResult = numberArguments [ 0 ];
    const recursiveGcdFunction = ( firstOperand , secondOperand ) => secondOperand ? recursiveGcdFunction ( secondOperand , firstOperand % secondOperand ) : firstOperand ;
    for ( let iterativeIndex = 1 ; iterativeIndex < numberArguments . length ; iterativeIndex ++ )
    {
        currentGcdResult = recursiveGcdFunction ( currentGcdResult , numberArguments [ iterativeIndex ] ) ;
    }
    return currentGcdResult ;
}


// Initiates the primary program execution
performMainExecution ( require("fs") . readFileSync ( "/dev/stdin", "utf8" ) ) ;


function performMainExecution ( rawProgramInput ) {
    let parsedInputData = rawProgramInput . split ( '\n' ) . map ( ( lineSegment , elementIndex , fullLineArray ) => stringArrayToIntegerArray ( lineSegment . split ( ' ' ) ) ) ;

    let firstParameter = parsedInputData [ 0 ] [ 0 ] ;

    let numericSequence = parsedInputData [ 1 ] . sort ( ( a , b ) => a - b ) ;

    let powerSeries = [ 1 ] ;

    let finalCalculatedValue = numericSequence . shift ( ) + numericSequence . shift ( ) ;
    finalCalculatedValue /= 2 ;

    while ( numericSequence . length )
    {
        numericSequence . push ( finalCalculatedValue ) ;
        numericSequence . sort ( ( valA , valB ) => valA - valB ) ;
        finalCalculatedValue = numericSequence . shift ( ) + numericSequence . shift ( ) ;
        finalCalculatedValue /= 2 ;
    }

    console . log ( finalCalculatedValue ) ;
    return 0 ;
}