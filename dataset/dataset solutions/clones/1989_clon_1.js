/* This JavaScript file defines a main function to process input. */

function    Main (    input    ) /* Entry point function */
{
    // Split the input string by newline characters to get an array of lines.
    const inputArr    =    input .split ("\n") ;


    /* The target string for character checking is the second line of input. */
    const    tarStr  =  inputArr [  1  ] ;


    let   i   =   1   ; // Initialize a counter for building the sequence.


    let   tarS   =   [ ] ; // This array will store a sequence of numbers up to inputArr[0].

    // Loop to populate the tarS array.
    while    (    i    <=    inputArr [  0  ]    )
    {
        tarS . push (  i  ) ; // Add the current number to the array.
        i ++ ; // Increment the counter.
    }


    let    num   =   0   ; // Initialize a counter for valid combinations.


    /*
     * Helper function: check if three characters are all distinct.
     * @param {string} v1 - First character.
     * @param {string} v2 - Second character.
     * @param {string} v3 - Third character.
     * @returns {boolean} True if all three characters are distinct, false otherwise.
     */
    const    check    = (  v1  ,  v2  ,  v3  )    =>
    {
        return    v1    !==    v2    &&    v2    !==    v3    &&    v3    !==    v1    ;
    } ;


    // Iterate through all possible combinations of three distinct indices.
    tarS . forEach ( first => { // Outer loop for the first index.
        tarS . forEach ( second => { // Middle loop for the second index.
            tarS . forEach ( third => { // Inner loop for the third index.
                // Check multiple conditions:
                // 1. Characters at first-1, second-1, third-1 positions in tarStr must be distinct.
                // 2. The indices must be strictly increasing: first < second < third.
                // 3. The differences between consecutive indices must not be equal
                //    (i.e., not an arithmetic progression).
                if    (
                    check ( tarStr [ first - 1 ] , tarStr [ second - 1 ] , tarStr [ third - 1 ] )
                    &&    first    <    second
                    &&    second    <    third
                    &&    (    second    -    first    !==    third    -    second    )
                )
                {
                    // If all conditions are met, log the combination and increment the counter.
                    console . log ( first , second , third ) ;
                    num ++ ; // Increment the count of valid combinations.
                }
            } ) ; // End of inner forEach (third)
        } ) ; // End of middle forEach (second)
    } ) ; // End of outer forEach (first)


    // Finally, print the total count of valid combinations.
    console . log ( num ) ;
}


// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;