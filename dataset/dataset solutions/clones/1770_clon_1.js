/*
 * This JavaScript program checks if a given number of animals (hiki)
 * and total legs (asi) is a physically possible combination.
 * Animals are assumed to have either 2 or 4 legs.
 *
 * Original problem context: 3hiki 8hon (3 animals, 8 legs)
 * This is a common programming puzzle.
 */
function   main   (   input   )
{
    // Step 1: Clean the input string by removing leading/trailing whitespace.
    input   =   input.trim( ) ;

    // Step 2: Parse the number of animals from the input string.
    // The input is expected to be two space-separated numbers.
    var   hiki   =   parseInt (   input.split (  " "  ) [ 0 ]   )   ;

    // Step 3: Parse the total number of legs from the input string.
    var   asi   =   parseInt (   input.split (  " "  ) [ 1 ]   )   ;

    // Step 4: Determine if the combination is valid.
    // If all animals were 2-legged, total legs would be hiki * 2.
    // If all animals were 4-legged, total legs would be hiki * 4.
    // Therefore, 'asi' must be within this range (inclusive).
    var   hantei   =   (   ( hiki * 2 )   <=   asi   &&   ( hiki * 4 )   >=   asi   )   ;

    // Step 5: Output the result based on the 'hantei' (judgment) variable.
    if   (   hantei   ==   true   )
    {
        console.log (   "Yes"   )   ;
    }
    else
    {
        console.log (   "No"   )   ;
    }
}


// This part of the code handles reading input from standard input
// and passing it to the 'main' function for processing.
// It uses Node.js 'fs' module to read the file specified by '/dev/stdin'.
main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;