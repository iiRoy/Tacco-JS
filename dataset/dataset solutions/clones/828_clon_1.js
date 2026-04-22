/*
 * This file is a Type I clone of another JavaScript source.
 * It is guaranteed to be logically and structurally identical to the original.
 * The only modifications made are to whitespace and comments,
 * ensuring the behavior remains precisely the same.
 */

//  Module import for file system operations.
var        input        =      require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  ) ;

//  Prepare the input: remove trailing newline, then split into an array of lines.
var        Arr          =      (  input . replace (  / \n $ / ,  ""  )  ) . split (  "\n"  ) ;


//  Main processing loop for multiple test cases.
while     (     true     )
{

    //  Extract the first line, convert to a number, and assign to 'n'.
    var        n        =      Arr . shift ( )     -     0 ;

    //  If 'n' is zero, it signals the end of input data.
    if     (     n     ===     0     )
    {
        break ; //  Exit the loop.
    }

    //  Initialize an empty array to store the results for the current test case.
    var        ans        =      [ ] ;

    //  Loop 'n' times to process each individual data entry.
    for     (     var        I        =      0 ;        I        <      n ;        I ++     )
    {

        //  Get the next line from 'Arr', split it by spaces.
        var        arr        =      (  Arr . shift ( )  ) . split (  " "  ) ;

        //  The first element is the 'name'.
        var        name       =      arr . shift ( ) ;

        //  Convert the remaining array elements to numbers.
        arr        =      arr . map (  Number  ) ;

        //  Prepend the 'name' back to the array.
        arr . unshift (  name  ) ;

        //  An Immediately Invoked Function Expression (IIFE) to encapsulate calculations.
        ( function ( L ,    P ,    A ,    B ,    C ,    D ,    E ,    F ,    S ,    M )
        {
            //  Calculate 'time' based on formula.
            var        time       =      A     +     B     +     C     +     (  ( D     +     E )     *     M  ) ;
            //  Calculate 'money' based on formula.
            var        money      =      ( F     *     S     *     M )     -     P ;
            //  Store the label and the calculated ratio.
            ans . push (  [ L ,     money     /     time ]  ) ;
        } ) . apply (  null ,     arr  ) ; //  Execute the IIFE with 'arr' elements as arguments.

    }

    /*
     *  Sort the 'ans' array.
     *  Primary sort key: ratio (money/time) in descending order.
     *  Secondary sort key (if ratios are equal): label (L) in ascending order.
     */
    ans . sort ( function ( a ,    b )
    {
        //  Check if the ratios are equal.
        if     (     a [ 1 ]     ===     b [ 1 ]     )
        {
            //  If ratios are equal, sort by label (first element) ascending.
            return    a [ 0 ]     >     b [ 0 ] ;
        }
        else
        {
            //  Otherwise, sort by ratio (second element) descending.
            return    b [ 1 ]     -     a [ 1 ] ;
        }
    } ) ;

    //  Iterate through the sorted results and print each label.
    ans . forEach ( function ( v ) {
        console . log ( v [ 0 ] ) ; //  Output the label.
    } ) ;

    //  Print a separator character after each set of results.
    console . log ( "#" ) ;

} //  End of while loop.