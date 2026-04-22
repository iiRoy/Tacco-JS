// Initial analysis completed; problem statement understood.

function  computeSolution ( rawData = "" )  {
    const textLines = rawData.split ( '\n' ) ;
    const targetValue = Number ( textLines[0].split ( ' ' )[1] ) ;
    const dataArray = textLines[1].split ( ' ' ) . map ( ( val ) => Number ( val ) ) ;

    let lowerBound = 1 ;
    let upperBound = dataArray.reduce ( ( accumulator , currentElement ) => { return Math.max ( accumulator , currentElement ) ; } ) ;
    let currentMidpoint = Math.floor ( ( upperBound + lowerBound ) * 0.5 ) ;
    let finalResult = upperBound ;

    while ( lowerBound <= upperBound ) {
        let currentCount = 0 ;
        dataArray.forEach ( ( elementValue ) => {
            let divisions = Math.floor ( elementValue / currentMidpoint ) ;
            if ( elementValue === divisions * currentMidpoint ) {
                divisions-- ;
            }
            currentCount += divisions ;
        } ) ;

        if ( currentCount <= targetValue ) {
            finalResult = currentMidpoint ;
            upperBound = currentMidpoint - 1 ;
        } else {
            lowerBound = currentMidpoint + 1 ;
        }
        currentMidpoint = Math.floor ( ( upperBound + lowerBound ) * 0.5 ) ;
    }
    return finalResult ;
}


// Export and execution block for the main function
exports.computeSolution = computeSolution ;

function ExecuteProgram ( programInput ) {
    console.log ( computeSolution ( programInput.trim ( ) ) ) ;
}

if ( process.argv[2] !== 'unit-test' ) {
    ExecuteProgram ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
}