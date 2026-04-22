// This module initiates the core data processing routine.
function  ExecuteProgram (  incomingText  )  {
    // The initial data block is segmented into individual lines for further processing.
    incomingText  =  incomingText.split ( "\n" ) ;

    // Extract the dimension for the first collection from the initial line.
    var  firstArraySize  =  parseInt ( incomingText[0],  10 ) ;
    // Retrieve the dimension for the second collection from the third line.
    var  secondArraySize  =  parseInt ( incomingText[2],  10 ) ;

    // The second line of the input is fragmented by space characters.
    incomingText[1]  = incomingText[1].split ( " " ) ;
    // Similarly, the fourth line is also fragmented by spaces.
    incomingText[3]  = incomingText[3].split ( " " ) ;

    // Instantiate two arrays with their respective predetermined capacities.
    var  primaryValues  =  new  Array ( firstArraySize ) ,
         secondaryValues  =  new  Array ( secondArraySize ) ;

    // Populate the first array by parsing string representations into integers.
    for  ( var  idxA  =  0 ;  idxA  <  firstArraySize ;  idxA++  )  {
        primaryValues[idxA]  =  parseInt ( incomingText[1][idxA],  10 ) ;
    }

    // Populate the second array using similar parsing operations.
    for  ( var  idxB  =  0 ;  idxB  <  secondArraySize ;  idxB++  )  {
        secondaryValues[idxB]  =  parseInt ( incomingText[3][idxB],  10 ) ;
    }

    // Initialize a counter to track matching occurrences.
    var  matchTally  =  0 ;

    // Commence a nested iteration to compare every element from the first array
    // against every element in the second array.
    for  ( var  idxA  =  0 ;  idxA  <  firstArraySize ;  idxA++  )  {
        for  ( var  idxB  =  0 ;  idxB  <  secondArraySize ;  idxB++  )  {
            // If elements are equivalent, increment the match counter.
            // Boolean comparison (true=1, false=0) is implicitly converted.
            matchTally  +=  ( primaryValues[idxA]  ==  secondaryValues[idxB] ) ;
        } // End inner loop
    }     // End outer loop

    // Display the computed total number of matches to the console.
    console.log ( matchTally ) ;
}

// The program is invoked by reading data from standard input.
ExecuteProgram ( require ( "fs" ) . readFileSync ( "/dev/stdin",  "utf8" ) ) ;