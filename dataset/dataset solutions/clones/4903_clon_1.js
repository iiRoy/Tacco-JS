function    Main (    input    )    /* This is the primary function for processing the input */
{
    // Begin processing the provided input data.

   var     input    =    input.split ( "\n" ) ; /* Reassigning the 'input' variable to an array of lines */


  var   K   =   parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;    // Extracting the first integer 'K' from the first line

  /*
   * The variable T is also extracted from the first line,
   * though its usage is not apparent in the subsequent logic.
   */
  var   T   =   parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;


  var   a   =   input [ 1 ] . split ( " " ) . map ( (  el  ,   i  )  =>  { /* Processing the second line of input */
         // Convert each element to an integer
         return   parseInt ( el ) ;
    }  )  ;

 /*
  * Sort the array 'a' in descending order.
  * The comparison (a < b) results in true (1) or false (0),
  * effectively sorting such that smaller values come first,
  * but since JavaScript's sort expects a negative, zero, or positive number,
  * `a < b` will treat `true` as 1 and `false` as 0.
  * This is a common pattern to achieve descending order when `a < b` implies `a` should come after `b`.
  */
  a  .  sort (  (   a   ,   b   )  =>  {
      // Custom sort comparison: if 'a' is less than 'b', 'a' comes before 'b'
      return   a   <   b
    }  )  ;


    // Calculate and log the final result.
    // This involves finding the maximum of two values:
    // 1. a[0] - 1 - (K - a[0])
    // 2. 0
    console . log (    Math . max . apply (    null    ,    [  a [ 0 ]   -   1   -   (  K   -   a [ 0 ]  )  ,  0  ]    )    )  ;

}   // End of Main function definition

// Invoking the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; /* Execution starts here */