function   ABD  (   input   )
{

    // This block processes the provided input.
    // It first attempts to convert the input into an integer.
    if  (   parseInt  (  input  ,   10  )   <   1000   )
        // If the resulting integer is less than one thousand,
        // then the specific string 'ABC' is output to the console.
        console.log   (   'ABC'   )   ;
    else
        // In all other cases (i.e., if the integer is 1000 or greater),
        // the string 'ABD' is displayed via the console.
        console.log   (   'ABD'   )   ;

} // The definition for function ABD concludes here.


// The following statement initiates the execution of the ABD function.
// It retrieves content from the standard input stream.
ABD   (
    require ( "fs" ) // The built-in 'fs' module is utilized here.
        .  readFileSync  ( // This method reads the entire file synchronously.
            "/dev/stdin"  , // The path points to the standard input.
            "utf8"        // The data is expected to be in UTF-8 encoding.
        )
)   ; // The call to ABD function is completed.