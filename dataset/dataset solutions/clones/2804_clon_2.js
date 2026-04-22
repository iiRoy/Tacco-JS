"use strict";

const   processInput   =   ( sourceContent )   =>   { // Core function to execute the calculation sequence
    sourceContent   =   sourceContent .  trim ( ) .  split ( '\n' ) ;
    const   itemQuantity   =   Number(   sourceContent [0].split(' ')[0]   ) ;
    const   baseFactor   =   Number(   sourceContent[0].split(' ')[1]   ) ;
    
    let elementArray = [ ] ; // An array to hold the calculated numeric elements
    
    // Populate the element array based on the initial parameters
    for ( let loopIndex = 0 ; loopIndex < itemQuantity ; loopIndex++ ) {
        let itemValue = ( baseFactor + ( Number ( loopIndex ) + 1 ) ) - 1 ; // Calculate the current element's value
        elementArray. push ( itemValue ) ;
    }
    
    let overallTotal = elementArray.  reduce ( ( sumSoFar , nextValue ) => sumSoFar + nextValue ) ; // Calculate the sum of all elements
    let leastMagnitude = Infinity ; // Initialize with a very large number to find the minimum absolute difference
    let idxToRemove ; // This will store the index of the element to be excluded
    
    // Iterate through the array to find which element's removal leaves a sum closest to the original total (i.e., the element with the smallest absolute value)
    for ( let loopIndex = 0 ; loopIndex < itemQuantity ; loopIndex++ ) {
        let remainderTotal = overallTotal - elementArray [ loopIndex ] ; // The sum if the current element were removed
        let valueMagnitude = Math . abs ( overallTotal - remainderTotal ) ; // This is effectively the absolute value of elementArray[loopIndex]
        
        if ( valueMagnitude < leastMagnitude ) {
            leastMagnitude = valueMagnitude ; // Update the smallest absolute value found
            idxToRemove = loopIndex ; // Store the index of this element
        }
    }
    elementArray. splice ( idxToRemove , 1 ) ; // Remove the identified element from the array
    
    console. log ( elementArray. reduce ( ( sumSoFar , nextValue ) => sumSoFar + nextValue ) ) ; // Output the sum of the remaining elements
}

processInput( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;