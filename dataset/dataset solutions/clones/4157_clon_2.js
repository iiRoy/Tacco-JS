function  processListElements (  inputItems  ) { // This function computes unique items and their respective counts.
 const     distinctElements = [ ] ,  frequencyArray = [ ] ;
 let       previousItem  ;

    // Arrange the input collection in ascending order for sequential processing.
    inputItems . sort ( ) ;

    for    (  let  counter = 0 ; counter < inputItems . length ; counter++  ) {
        if   (  inputItems[ counter ]  !==  previousItem  ) {
             distinctElements . push (  inputItems[ counter ]  ) ;  // Record a newly encountered distinct element.
             frequencyArray . push (   1   ) ;  // Initialize its occurrence count to one.
        }  else  {
             frequencyArray [  frequencyArray . length - 1  ] ++ ;  // Increment the count for the last distinct element.
        }
        previousItem  =  inputItems[ counter ] ;  // Store the current element as the previous one for the next iteration.
    }

    return  [  distinctElements , frequencyArray  ] ; // Deliver the pair of arrays: unique elements and their frequencies.
}


function  StartApplication (  sourceContent  ) {
    // Break down the entire input string into individual lines.
    sourceContent = sourceContent . split ( "\n" ) ;

    const  itemCount = parseInt (  sourceContent[ 0 ] ,  10  ) ; // Extract the first line as the expected number of items.
    let    itemNumbers = sourceContent[ 1 ] . split (  " "  ) ; // Parse the second line into a collection of string representations of numbers.

    // Convert each string number within the collection to its integer equivalent.
    itemNumbers . forEach ( ( currentVal , idxPos ) => itemNumbers[ idxPos ] = parseInt ( currentVal , 10 ) ) ;

    // Invoke the frequency calculation utility with the prepared numeric data.
    const  processedData = processListElements ( itemNumbers ) ;

    let    cumulativeDiff = 0 ; // Initialize a variable to accumulate the final adjustment value.

    // Iterate through the results to determine the overall required adjustments.
    for (  let  idx = 0 ; idx < processedData[ 0 ] . length ; idx++  ) {
        const  elementValue = processedData[ 0 ] [ idx ] ; // Retrieve the actual value from the unique elements array.
        const  occurrenceVal = processedData[ 1 ] [ idx ] ; // Retrieve its corresponding frequency count.

        if (  elementValue !== occurrenceVal  ) { // Compare the element's value with its frequency.
            if (  elementValue < occurrenceVal  ) {
                // Scenario: Value is less than its frequency. We need to reduce occurrences.
                cumulativeDiff += occurrenceVal - elementValue ;
            }
            if (  elementValue > occurrenceVal  ) {
                // Scenario: Value is greater than its frequency. All occurrences must be 'removed'.
                cumulativeDiff += occurrenceVal ;
            }
        }
    }

    console . log ( cumulativeDiff ) ; // Display the final computed adjustment sum.
}


// The following section is for standard input/output handling and should not be altered.
StartApplication ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;