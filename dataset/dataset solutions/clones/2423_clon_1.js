/*
 * This is a JavaScript program.
 * The 'input' parameter will receive the entire input data.
 */
function   Main   (   input   )
{
    // Declare a variable 'a'. It's currently undefined.
    var    a    ;


    /*
     * Output section:
     * We're calculating the square of 'a' and printing it to the console.
     */
    console.log (   a   *   a   )   ;
}

// ********************************************************************************
// * Do not modify the code below this line.                                      *
// * It handles reading input from stdin and invoking the Main function.          *
// ********************************************************************************
Main  (  require (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;