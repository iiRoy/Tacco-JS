/*
 * This is the main function responsible for processing the input
 * and calculating the Levenshtein distance between two strings.
 */
function     Main(     input     ) {

    // Split the input string by newlines to get individual lines
    var    strArr    =    input.split(  "\n"  )    ;

    // Extract the first string (s) and the second string (t)
    var    s    =    strArr[0]    ;

    var    t    =    strArr[1]    ;


    // Get the lengths of the two strings
    var    n    =    s.length    ;
    var    m    =    t.length    ;


    // Initialize a 2D array (dynamic programming table)
    var    dp    =    [    ]    ;


    // Initialize the first column of the DP table
    // This represents the cost of transforming an empty string into a prefix of s
    for    (    var    i    =    0    ;    i    <=    n    ;    i++    )    {

        dp[i]    =    [    ]    ;
        dp[i][0]    =    i    ;

    }


    // Initialize the first row of the DP table
    // This represents the cost of transforming a prefix of t into an empty string
    for    (    var    i    =    0    ;    i    <=    m    ;    i++    )    {

        dp[0][i]    =    i    ;

    }


    // Fill the DP table using the Levenshtein distance algorithm
    // Iterate through each character of string s
    for    (    var    i    =    1    ;    i    <=    n    ;    i++    )    {

        // Iterate through each character of string t
        for    (    var    j    =    1    ;    j    <=    m    ;    j++    )    {

            /*
             * Calculate the cost for dp[i][j]
             * This involves three possibilities:
             * 1. Deletion: dp[i-1][j] + 1
             * 2. Insertion: dp[i][j-1] + 1
             * 3. Substitution/Match: dp[i-1][j-1] + (cost of mismatch)
             *    The cost of mismatch is 0 if characters match, 1 otherwise.
             */
            dp[i][j]    =    Math.min(
                                    Math.min(
                                            dp[i    -    1][j]    ,
                                            dp[i][j    -    1]
                                    )    +    1    ,
                                    dp[i    -    1][j    -    1]    +    (
                                                                    s[i    -    1]    ==    t[j    -    1]    ?    0    :    1
                                                                    )
                            )    ;

        }

    }


    // The final result is the bottom-right element of the DP table
    console.log(    dp[n][m]    )    ;

}


// Execute the main function with input read from standard input
// This part handles reading the input in a Node.js environment
Main(    require(    "fs"    )    .    readFileSync(    "/dev/stdin"    ,    "utf8"    )    )    ;