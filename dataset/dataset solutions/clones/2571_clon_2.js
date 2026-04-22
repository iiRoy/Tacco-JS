// This program defines a function to compute and display the cube of a number
// obtained from the first line of an input string.

function   ProcessAndOutput   (   textualInput   )
{
    // The incoming textual data is first broken down into an array of individual lines.
    // Each element in this array corresponds to a line from the original input.
    const   lineSegments   =   textualInput . split (  "\n"  )   ;

    // The very first line (at index 0) is extracted. It is then explicitly
    // converted from a string to a numeric type, preparing it for arithmetic operations.
    let     firstNumber    =   Number (  lineSegments [ 0 ]  )   ;

    // The cube of the processed numeric value is calculated.
    // This result is then printed to the console's standard output.
    console . log (  firstNumber  *  firstNumber  *  firstNumber  )   ;
}


// The main execution point of the script.
// It retrieves content from the system's standard input file,
// specifying 'utf-8' as the character encoding for robust text handling.
// This obtained content is then passed to our processing function.
ProcessAndOutput (
    require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf-8"  )
) ;