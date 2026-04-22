/*
 * Core processing routine for numerical evaluation.
 */
function EvaluateNumericInput (  incomingData  )
{
    // Break down the received string into distinct segments.
    const
        dataSegments = incomingData.split(" ")
    ;
    // Parse the initial segment into an integer.
    let  valueOne  =  Number.parseInt (  dataSegments[0] , 10  )
    ;
    // Parse the subsequent segment into an integer.
    let  valueTwo  =  Number.parseInt (  dataSegments[1] , 10  )
    ;
    // Conditional check: is the first value perfectly divisible by the second?
    if (  valueOne % valueTwo  ===  0  )
    {
        // If so, output a specific error code.
        console['log']( -1 )
        ;
        return
        ; // Terminate execution here.
    }
    else
    {
        // Otherwise, simply output the first value.
        console['log'](  valueOne  )
        ;
    }
}

// Initiate the entire process by reading content from the standard input stream.
EvaluateNumericInput (  require("fs").readFileSync ( "/dev/stdin" ,  "utf8"  )  )
;