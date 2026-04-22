"use strict"; // This directive enables strict mode for the entire script.

// The main function, which takes an argument 'arg' for processing.
const main =  arg  => {
    // First, remove leading/trailing whitespace from the input,
    // then split it into an array of strings based on newline characters.
    arg  =  arg . trim ( ) . split ( "\n" ) ;

    const S = arg[ 0 ] ; // The first line of input is assigned to the constant S.
    const T = arg[ 1 ] ; // The second line of input is assigned to the constant T.

    // This loop iterates backwards to find the rightmost possible occurrence of T in S.
    // 'i' represents the starting index in S where T might begin.
    for  ( let  i = S . length  -  T . length ;  i  >=  0 ;  i--  )
    {
        let   flag   =   true   ; // A boolean flag, initially true, to indicate a potential match.
        let sub = S.substr(i, T.length); // Extract a substring from S of the same length as T, starting at index i.

        // Inner loop to compare each character of the extracted 'sub'string with 'T'.
        for ( let j = 0 ; j < T . length ; j ++ )
        {
            // Check for a mismatch: if characters are not equal AND the character in 'sub' is not a wildcard '?'.
            if  (  sub . charAt ( j )  !==  T . charAt ( j )  &&  sub . charAt ( j )  !==  "?"  )
            {
                flag  =  false  ; // If a definitive mismatch is found, set the flag to false.
                break  ; // No need to check further characters for this 'sub', so exit the inner loop.
            }
        }

        // After checking all characters, if the flag is still true, it means T can be "restored" at this position.
        if ( flag === true )
        {
            // Construct the 'answer' string:
            // 1. The part of S before the potential match (S.substring(0, i)).
            // 2. The string T itself.
            // 3. The part of S after the potential match (S.substring(parseInt(i) + T.length)).
            let   answer   =   S . substring ( 0 , i )   +   T   +   S . substring ( parseInt ( i )   +   T . length )   ;

            // Replace all remaining '?' characters in the 'answer' with the letter 'a'.
            answer  =  answer . replace ( /\?/g ,  "a" ) ;

            console . log ( answer ) ; // Output the successfully restored string.
            return ; // Terminate the function as the first valid restoration has been found and printed.
        }
    }

    // If the loop completes without finding any restorable position,
    // it means T cannot be placed into S according to the rules.
    console . log ( "UNRESTORABLE" ) ;
}

// Invoke the main function, providing it with input read from standard input.
// 'require('fs')' imports the Node.js file system module.
// '.readFileSync('/dev/stdin', 'utf8')' synchronously reads the content of '/dev/stdin'
// (which is typically where standard input comes from in competitive programming environments)
// and decodes it as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;