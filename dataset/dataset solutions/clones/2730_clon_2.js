// This function computes a specific numerical result based on input data.
function   calculateResult(    rawDataString    ) {
    // Split the entire input string into individual lines.
    const   inputLines   =   rawDataString.split(   '\n'   )   ;

    // Get the very first line and then split it by spaces.
    const   firstLineTokens   =   inputLines[  0  ].split(  ' '  )  ;

    // Parse the first token as an integer representing the total count.
    const   totalElements   =   parseInt(   firstLineTokens[   0   ]   ,   10   )   ;

    // Parse the second token as an integer for the effective detection range.
    const   detectionRange   =   parseInt(   firstLineTokens[   1   ]   ,   10   )   ;

    // Calculate the minimum number of units required, rounding up.
    console.log(   Math.ceil(   totalElements   /   (   detectionRange   *   2   +   1   )   )   )   ;
}

// Read data from standard input and then invoke the primary computation function.
calculateResult(   require(   'fs'   ).readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;