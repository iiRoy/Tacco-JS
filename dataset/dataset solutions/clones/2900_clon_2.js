// This module's primary function is to interpret and execute a series of computational requests.
function  ProcessQueries ( receivedText )
{
    // The raw input string is first segmented into distinct lines for easier processing.
    let  processedLines  =  receivedText.split ( "\n" ) ;

    // The initial line specifies the total quantity of operations to be performed.
    const  numOperations  =  parseInt ( processedLines [ 0 ] ) ;

    // Subsequent lines are transformed into a collection of numerical arrays, each representing a single operation's parameters.
    let  operationDetails  =  processedLines . slice ( 1, numOperations + 1 ) . map (
        ( lineStr )  =>  lineStr . split ( " " ) . map ( ( numStr )  =>  parseInt ( numStr ) )
    ) ;

    // An array is prepared to hold the final outcome for each processed operation, initialized to zero.
    let  outputValues  =  Array ( numOperations ) . fill ( 0 ) ;

    // We now iterate through each defined operation to compute its specific result.
    for  ( let  opIndex  =  0 ;  opIndex  <  operationDetails . length ;  opIndex ++ )
    {
        // Extracting specific parameters for the current operation to enhance readability.
        const  currentOpParams  =  operationDetails [ opIndex ] ;
        const  initialValueTerm  =  currentOpParams [ 0 ] ;
        const  progressionFactor  =  currentOpParams [ 1 ] ;
        const  iterationLimit  =  currentOpParams [ 2 ] ;

        // A nested loop performs the core calculation, iterating as specified by the operation.
        for  ( let  stepCount  =  0 ;  stepCount  <  iterationLimit ;  stepCount ++ )
        {
            if  ( stepCount  ===  0 )
            {
                // The very first step involves a simple modulo operation on the initial term.
                outputValues [ opIndex ]  =  initialValueTerm  %  1000003 ;
            }
            else
            {
                // Subsequent steps update the accumulated result using a multiplicative and additive formula, then applying modulo.
                outputValues [ opIndex ]  =  ( outputValues [ opIndex ]  *  ( initialValueTerm  +  stepCount  *  progressionFactor ) )  %  1000003 ;
            }
        }
        // After all steps for an operation are complete, its final result is logged.
        console . log ( outputValues [ opIndex ] ) ;
    }
}
// This concluding section is responsible for reading standard input and invoking the main processing function; it must not be altered.
ProcessQueries ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;