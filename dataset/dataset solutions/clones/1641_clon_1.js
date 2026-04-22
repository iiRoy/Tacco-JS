/*
 * This JavaScript code represents a functional translation of the original C++ snippet.
 * It has been extensively modified in terms of whitespace and comments
 * to demonstrate Type I cloning principles within the JavaScript language context.
 * The core logic and structure remain identical to the C++ source.
 */

//  The primary function of this script, acting as an entry point.
//  It processes user input and conditionally prints values.
const main = ( ) => {

    //  Declare a mutable variable 'x'.
    //  In a browser environment, 'prompt' obtains user input as a string.
    //  'parseInt' converts this string into an integer for numerical comparisons.
    let x  =  parseInt (  prompt (  "Please enter an integer for processing:"  )  ) ;


    //  ---  Begin conditional logic blocks  ---


    //  Check if the value of 'x' is strictly greater than 400 AND strictly less than 599.
    if  (  (  400  <  x  )  &&  (  599  >  x  )  )
    {
        //  If the condition holds true, output the integer 8 to the console.
        console.log (  8  ) ;
    }


    //  Check for the next range: 'x' greater than 600 AND less than 799.
    if  (  (  600  <  x  )  &&  (  799  >  x  )  )
    {
        //  Output the integer 7 if 'x' falls within this specific range.
        console.log (  7  ) ;
    }


    //  Evaluate if 'x' is greater than 800 AND less than 999.
    if  (  (  800  <  x  )  &&  (  999  >  x  )  )
    {
        //  Print the integer 6 based on this condition.
        console.log (  6  ) ;
    }


    //  Determine if 'x' is greater than 1000 AND less than 1199.
    if  (  (  1000  <  x  )  &&  (  1199  >  x  )  )
    {
        //  Log the integer 5 to the console.
        console.log (  5  ) ;
    }


    //  Check for the range where 'x' is greater than 1200 AND less than 1399.
    if  (  (  1200  <  x  )  &&  (  1399  >  x  )  )
    {
        //  Output the integer 4 if the condition is met.
        console.log (  4  ) ;
    }


    //  Examine if 'x' is greater than 1400 AND less than 1599.
    if  (  (  1400  <  x  )  &&  (  1599  >  x  )  )
    {
        //  Print the integer 3.
        console.log (  3  ) ;
    }


    //  Verify if 'x' is greater than 1600 AND less than 1799.
    if  (  (  1600  <  x  )  &&  (  1799  >  x  )  )
    {
        //  Log the integer 2.
        console.log (  2  ) ;
    }


    //  Finally, check if 'x' is greater than 1800 AND less than 1999.
    if  (  (  1800  <  x  )  &&  (  1999  >  x  )  )
    {
        //  Output the integer 1 if 'x' falls into this highest specified range.
        console.log (  1  ) ;
    }

} ; //  End of the 'main' function definition.


//  Invoke the 'main' function to commence program execution.
main ( ) ;