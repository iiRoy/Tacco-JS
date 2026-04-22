/*
 * This section handles the input reading mechanism.
 * It uses the 'readline' module to create an interface for standard input/output.
 */
var   reader   =  require('readline') . createInterface( {  input : process . stdin ,  output : process . stdout   }  ) ;

// An array to store all the input lines received.
var   lines = [  ] ;


reader  . on ( 'line' ,  function   (   line   )   {
        lines . push ( line ) ;
} ) ;


/*
 *  This is the main processing logic, executed once the input stream is closed.
 *  The calculations are performed here.
 */
reader . on (  'close'  ,  function (  )  {

        // Parse the first line of input to extract integer values for a, b, and x.
        var   a   =   Number(  lines[0] . split(" ")[0]  ) ;
        var   b   =   Number (  lines[0] . split ( " " ) [1]  ) ;
        var   x   =   Number ( lines [0] . split ( " " ) [2]  ) ;

        // Calculate the initial value of 'f' based on 'b', 'x', and 'a'.
        var   f   =   b / x - a / x ;

        // If 'a' is perfectly divisible by 'x', increment 'f' by 1.
        if (  a % x == 0  )
        {
                f = f + 1 ;
        }

        // Output the final calculated value of 'f' to the console.
        console . log (  f  ) ;

}  ) ;