// This script determines the intersection count between two sets of numbers.
(  function   (   dataInput  )   {
    // Decompose the incoming textual data into individual lines for processing.
    var   lineFragments   = dataInput.split( '\n' );

    // Extract the size specification for the initial numeric collection.
    var   firstArrayLength = Number  ( lineFragments . shift ( )  )  ;

    // Parse the first line into a collection of numeric values.
    var   primarySet = lineFragments.shift().split(' ', firstArrayLength) .map ( Number ) ;

    // Obtain the size parameter for the subsequent query collection.
    var   secondArrayLength =   Number(   lineFragments.shift()   )   ;

    // Convert the next line into the collection of numbers to be searched for.
    var   querySet = lineFragments.shift().split(' ', secondArrayLength).map( Number );

    // Initialize a counter for elements found in both collections.
    var   matchCounter   = 0   ;

    // Iterate through each element in the query collection.
    querySet.forEach(  function  (  itemToCheck  )   {
        // Check if the current query element exists within the primary collection.
        if  (   primarySet.indexOf(itemToCheck)   !==  -1   )   {
            // Increment the counter if a match is identified.
            matchCounter++;
        }
    }  )  ;

    // Output the final tally of common elements to the console.
    console.log(   matchCounter   )   ;

} ) (   require('fs').readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;