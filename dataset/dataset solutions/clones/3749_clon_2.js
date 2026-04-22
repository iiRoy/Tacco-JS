"use strict" ;

const initiateProcessing = ( rawDataPayload ) => {
    // Pre-process the incoming data string: remove outer whitespace and split into an array of lines.
    rawDataPayload = rawDataPayload . trim() . split ( '\n' ) ;

    // Extract numerical components from the first line of the processed data.
    const digitCountIndex = Number . parseInt ( rawDataPayload [0] . split ( ' ' ) [0] ) ;
    const primaryNumericValue = Number . parseInt ( rawDataPayload [0] . split ( ' ' ) [1] ) ;

    // These lines were part of an earlier version or commented out during development.
    // let auxiliaryBuffer = [ ... Array ( digitCountIndex * 2 ) ] . fill ( 0 ) ;
    // console . log ( primaryNumericValue + String ( auxiliaryBuffer . join ( '' ) ) ) ;

    // Conditional output based on the determined digit count index.
    if ( digitCountIndex === 0 ) {
        // If the index is zero, simply display the primary numeric value.
        console . log ( primaryNumericValue ) ;
        return ;
    }

    if ( digitCountIndex === 1 ) {
        // If the index is one, append two zeros to the primary numeric value.
        console . log ( primaryNumericValue + '00' ) ;
        return ;
    }

    if ( digitCountIndex === 2 ) {
        // If the index is two, append four zeros to the primary numeric value.
        console . log ( primaryNumericValue + '0000' ) ;
        return ;
    }
} ;

// Invoke the main processing routine, feeding it content read from standard input.
initiateProcessing ( require ( 'node:fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;