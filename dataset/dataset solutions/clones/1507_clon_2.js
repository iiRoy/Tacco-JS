function AnalyzeDiceRolls ( dataStream )
{
    const inputLines = dataStream.split ( "\n" ) ;

    const totalIterations =  parseInt( inputLines[0], 10 ) ;

    let finalOutcome =   "No" ;
    let sequentialPairs = 0 ;

    for ( let iterationCounter = 1 ;  iterationCounter <= totalIterations ; iterationCounter++ )
    {
        const currentValues =   inputLines[iterationCounter].split(" ") ;

        if (  parseInt(currentValues[0], 10)  ===  parseInt(currentValues[1], 10)  )
        {
            sequentialPairs ++ ;

            if ( sequentialPairs >= 3 )
            {
                finalOutcome = "Yes" ;
                break ;
            }

            continue ;
        }

        sequentialPairs = 0 ;
    }


    // Display the computed final result
    console.log ( finalOutcome ) ;
}


// DO NOT MODIFY BELOW THIS LINE; it handles standard input/output and invokes the main processing function.
AnalyzeDiceRolls( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;