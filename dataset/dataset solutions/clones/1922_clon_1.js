"use strict" ;

// This is a Type I clone generated to demonstrate whitespace and comment variations.
// All functional aspects and identifiers remain exactly as in the original.

var   __importStar   =  (   this   &&   this . __importStar   )   ||   function  (   mod   )
{

    // Check if the module is already an ES module.
    if   (   mod   &&   mod . __esModule   )   return   mod ;

    var   result   =   {   } ;

    // Iterate over properties of the module.
    if   (   mod   !=   null   )
    {
        for   (   var   k   in   mod   )
        {
            if   (   Object . hasOwnProperty . call (   mod ,   k   )   )
            {
                result [ k ]   =   mod [ k ] ;
            }
        }
    }


    // Add default export.
    result [ "default" ]   =   mod ;

    return   result ;
} ;

// Define __esModule on exports object.
Object . defineProperty (   exports ,   "__esModule" ,   {   value :   true   }   ) ;

// Import the 'fs' module using the __importStar helper.
var   fs   =   __importStar (   require (   "fs"   )   ) ;


// Main execution block.
{

    // Debug flag for switching between test input and standard input.
    var   isDebug   =   false ;

    // Main function that processes input arguments.
    var   main   =   function  (   args   )
    {
        // Parse the input string into numerical values.
        var   {   a ,   b ,   n   }   =   parser_1 (   args   ) ;

        // Output the parsed values to the console.
        console . log (   a ,   b ,   n   ) ;
    } ;

    // Parser function to convert string input to an object with numbers.
    var   parser_1   =   function  (   inputStr   )
    {
        // Split the input string by space.
        var   [   aStr ,   bStr ,   nStr   ]   =   inputStr . split (   ' '   ) ;

        // Convert string parts to numbers and return as an object.
        return   {
            a :   Number (   aStr   ) ,
            b :   Number (   bStr   ) ,
            n :   Number (   nStr   ) ,
        } ;
    } ;

    // Conditional execution based on the debug flag.
    if   (   isDebug   )
    {
        // Debug input string.
        var   Q1   =   '5 7 4' ;

        // Call main with debug input.
        main (   Q1   ) ;
    }
    else
    {
        // Read input from /dev/stdin for production.
        main (   fs . readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;
    }
}
// End of main execution block.