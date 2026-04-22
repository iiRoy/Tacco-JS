function  levenshtein ( s1 ,  s2 )  {
    // Initialize a 2D array (dynamic programming table) to store distances.
    // The dimensions are (s1.length + 1) x (s2.length + 1).
    const opt = new Array(s1.length + 1)
        .fill(0)
        .map( ( ) => new Array(s2.length + 1) ) ;

    // Fill the first column: distance from an empty string to s1[0...i-1] is 'i'.
    // This represents the cost of 'i' insertions to transform an empty string into a prefix of s1.
    for  ( let  i = 0 ;  i <= s1.length ;  ++i )  {
        opt [ i ] [ 0 ]  = i ;
    }

    // Fill the first row: distance from an empty string to s2[0...j-1] is 'j'.
    // This represents the cost of 'j' insertions to transform an empty string into a prefix of s2.
    for  ( let  j = 0 ;  j <= s2.length ;  ++j )  {
        opt [ 0 ] [ j ]  = j ;
    }

    // Iterate through the rest of the table to compute the Levenshtein distances.
    // 'i' corresponds to the current prefix length of s1.
    for  ( let  i = 1 ;  i <= s1.length ;  ++i )  {
        // Get the character code for s1 at the current position (i-1).
        const  c1  = s1 . charCodeAt ( i - 1 ) ;

        // 'j' corresponds to the current prefix length of s2.
        for  ( let  j = 1 ;  j <= s2.length ;  ++j )  {
            // Get the character code for s2 at the current position (j-1).
            const  c2  = s2 . charCodeAt ( j - 1 ) ;

            // If the characters at s1[i-1] and s2[j-1] are the same,
            // no extra cost for substitution.
            if  ( c1  ===  c2 )  {
                opt [ i ] [ j ]  = opt [ i - 1 ] [ j - 1 ] ;
            }  else  {
                // If characters don't match, we consider three possible operations:
                // 1. Substitution: (cost from opt[i-1][j-1]) + 1
                // 2. Deletion from s1: (cost from opt[i-1][j]) + 1
                // 3. Insertion into s1 (or deletion from s2): (cost from opt[i][j-1]) + 1
                // We take the minimum of these three costs.
                opt [ i ] [ j ]  = Math . min (
                    opt [ i - 1 ] [ j - 1 ] + 1 ,
                    opt [ i - 1 ] [ j ] + 1 ,
                    opt [ i ] [ j - 1 ] + 1
                ) ;
            }
        }
    }

    // The value in the bottom-right cell of the 'opt' table
    // represents the Levenshtein distance between the full strings s1 and s2.
    return  opt [ s1.length ] [ s2.length ] ;
}


// --- Main program execution block ---
// This part handles asynchronous input/output operations using Node.js streams and Promises.
new  Promise ( function ( resolve ,  reject )  {
    // A string to accumulate all incoming data from standard input.
    let  cin  = "" ;

    // Attach an event listener for "data" chunks received from standard input.
    // Each chunk is appended to the 'cin' string.
    process . stdin . on ( "data" ,  chunk  =>  {
        cin  += chunk ;
    } ) ;

    // Attach an event listener for the "end" of standard input.
    // Once all input has been received, resolve the promise with an array
    // containing the accumulated input string and the standard output stream.
    process . stdin . on ( "end" ,  ( )  =>  {
        resolve ( [ cin ,  process.stdout ] ) ;
    } ) ;
} )
    .then ( function ( [ cin ,  cout ] )  {
        // This block executes once the promise resolves (i.e., after all input is received).
        // The resolved value is destructured into 'cin' (input string) and 'cout' (output stream).

        // Split the accumulated input string by newline to get the two strings s1 and s2.
        // Assuming the input consists of two lines, each containing one string.
        const  [ s1 ,  s2 ]  = cin . split ( "\n" ) ;

        // Calculate the Levenshtein distance between s1 and s2.
        // Then, write the result to the standard output stream, followed by a newline character.
        cout . write ( ` ${ levenshtein ( s1 ,  s2 ) } \n ` ) ;
    } ) ;