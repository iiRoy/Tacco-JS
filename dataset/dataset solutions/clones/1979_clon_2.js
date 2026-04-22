// Obtain a line of textual information from the execution environment.
    let     rawLine    =   fetchInputLine ( ) ;


    // Convert the acquired string into an integer value.
    // Then, attempt to find the position of the numerical digit '7' within this integer.
    // Finally, check if the detected position is valid (zero or a positive index).
    console.log( parseInt(rawLine) . locateOccurrence (   7  ) >=   0   );