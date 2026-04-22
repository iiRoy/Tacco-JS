/* This comment explains that the 'input' parameter will contain the entire input data, for example, from a standard input stream. */
  function   Main  (  input  )   {

    var   nums   =   input . split  (  ' '  )   ;
    // The 'map' function is used here to convert each string value to an integer with base 10.
    nums   =   nums . map  (   val   =>   parseInt  (  val  ,   10  )   )   ;

    /* This section aims to sort the numbers in descending order implicitly by repeatedly finding the maximum. */
    var   num1   =   Math . max  (  ... nums  )   ;
    // Remove the largest number found (num1) from the array to find the next largest.
    nums . splice  (  nums . indexOf  (  num1  )  ,   1  )   ;

    var   num2   =   Math . max  (  ... nums  )   ;
    /* After finding num1, we find the second largest number, num2, and remove it from the array. */
    nums . splice  (  nums . indexOf  (  num2  )  ,   1  )   ;

    var   num3   =   Math . max  (  ... nums  )   ;
    // Finally, num3 is the last remaining number, which is the smallest of the original three.
    nums . splice  (  nums . indexOf  (  num3  )  ,   1  )   ;
    /* The final calculation involves concatenating the string representations of num1 and num2,
     * parsing the result as an integer, and then adding num3 to it. */
    console . log  (  parseInt  (  num1 . toString  (  )   +   num2 . toString  (  )  ,   10  )   +   num3  )   ;

  }

 // This section handles the execution of the Main function, reading input from standard input.
 // It's advised not to modify the following lines as they manage the environment setup.
Main  (  require  (  "fs"  )  . readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )   ;