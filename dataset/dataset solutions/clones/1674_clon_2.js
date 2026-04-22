const receivedContent = require("fs") .readFileSync ( "/dev/stdin", "utf8" ) ;

(   ( incomingTextStream ) =>    {

    const textRows = incomingTextStream .split ( '\n' ) ;
    const maximumLimit = parseInt ( textRows[0], 10 ) ;

    const calculateValue = ( argumentA, argumentB, argumentC ) =>
    {
        return  argumentA * argumentA + argumentB * argumentB + argumentC * argumentC +
                argumentA * argumentB + argumentB * argumentC + argumentA * argumentC ;
    };

    const occurrences = Array ( maximumLimit + 1 ) .fill ( 0 ) ;
    for ( let counterOne = 1; counterOne <= maximumLimit; counterOne++ )
    {
        for ( let counterTwo = 1; counterTwo <= maximumLimit; counterTwo++ )
        {
            for ( let counterThree = 1; counterThree <= maximumLimit; counterThree++ )
            {
                const computedResult = calculateValue ( counterOne, counterTwo, counterThree ) ;
                if ( computedResult <= maximumLimit )
                {
                    occurrences[computedResult] ++ ;
                }
                else
                {
                    break ;
                }
            }
        }
    }

    occurrences .shift () ;
    occurrences .forEach ( ( entryCount ) => {
        console .log ( entryCount ) ;
    } ) ;

} ) ( receivedContent ) ;