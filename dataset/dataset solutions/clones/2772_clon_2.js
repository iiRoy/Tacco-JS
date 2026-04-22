"use strict";
// This self-executing function processes incoming textual data
(  function  ( textPayload  )   {

    // Trim leading/trailing whitespace from the raw input string
    textPayload = textPayload.trim();
    // Split the input into lines, handling multiple newlines as a single delimiter
    textPayload = textPayload.split(  / \n + /  ) ;

    // Parse the first line for the number of elements
    const numElements =   textPayload [ 0 ]   -   0   ,
          // Parse the second line, splitting by whitespace and converting each part to a number
          numericValues =   textPayload [ 1 ] . split (  / \s + /  ) . map (  item  =>   item   -   0   ) ;

    // Initialize a cumulative sum with the last element of the numeric sequence
    let runningTotal =   numericValues [   numElements   -   1   ] ;

    // Loop through half of the elements (excluding the last one)
    for  (  let   idx = 0 ;   idx < ( numElements - 1 ) / 2 ;   idx ++  )   {
        // Subtract an element at an even index
        runningTotal -=   numericValues [   2   *   idx   ] ;
        // Add an element at the subsequent odd index
        runningTotal +=   numericValues [   2   *   idx   +   1   ] ;
    }

    // Start building the final sequence in reverse order
    const finalSequenceReversed = [   runningTotal   ] ;

    // Iterate backwards from the second-to-last element
    for  (  let   idx =   numElements   -   2 ;   idx >= 0 ;   idx --  )   {
        // Calculate the next element based on the current numeric value and the last computed result
        finalSequenceReversed . push (  2   *   numericValues [   idx   ]   -   finalSequenceReversed [   finalSequenceReversed . length   -   1   ]  ) ;
    }

    // Reverse the sequence to obtain the correct order of results
    const orderedResults =   finalSequenceReversed . reverse (  ) ;

    // Output the final computed sequence, with elements joined by a single space
    console . log (   orderedResults . join (  " "  )   ) ;

} ) (   require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )   ) ;