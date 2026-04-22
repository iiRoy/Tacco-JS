"use strict"

function ProcessData ( rawData ) {
    // Cleanse the raw input string, convert to an array of numbers
    let processedValues = rawData . trim ( ) . split ( / \s+ / ) . map ( numericVal => numericVal - 0 ) ;

    // The total number of elements to process
    const elementCount = processedValues . shift ( ) ;

    // finalPositions[colorId] stores the most recent index where colorId appeared
    const finalPositions = [ ] ;
    // Initialize the finalPositions array with a default 'unseen' state for a large range of possible colors
    for ( let idx = 0 ; idx < 2_000_000 ; idx ++ ) {
        finalPositions [ idx ] = "unseen" ;
    }
    // Set the initial position for the very first color
    finalPositions [ processedValues [ 0 ] ] = 0 ;

    // waysToPaint[k] represents the number of distinct painting combinations up to item k
    const waysToPaint = [ 1 ] ;
    // Define a large modulo value to prevent integer overflow
    const MODULO_VAL = ( 10 ** 9 ) + 7 ;

    // Iterate through the remaining elements to calculate painting combinations
    for ( let currentIdx = 1 ; currentIdx < elementCount ; currentIdx ++ ) {
        let currentColor = processedValues [ currentIdx ] ;

        // If the current color hasn't been seen before, or it was last seen at the immediately preceding position
        if ( finalPositions [ currentColor ] === "unseen" || finalPositions [ currentColor ] === currentIdx - 1 ) {
            // Only one way to extend the painting: simply add this new color
            waysToPaint [ currentIdx ] = waysToPaint [ currentIdx - 1 ] ;
        } else {
            // If the color has been seen before at a non-adjacent position
            // The total ways are the sum of ways ending at the previous position
            // plus ways ending at the previous occurrence of this color
            waysToPaint [ currentIdx ] = ( waysToPaint [ currentIdx - 1 ] + waysToPaint [ finalPositions [ currentColor ] ] ) % MODULO_VAL ;
        }
        // Update the last known position for the current color
        finalPositions [ currentColor ] = currentIdx ;
    }

    // Output the final number of unique painting ways for the entire sequence
    console . log ( waysToPaint . pop ( ) ) ;
}

// Read input from standard input and pass it to the main processing function
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;