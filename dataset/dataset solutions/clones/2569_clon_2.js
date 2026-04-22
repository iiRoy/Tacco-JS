"use strict" ;

let   executeProcessing   =   (   inputContent   )   =>   {
    // Adjust the raw input string by trimming and splitting into lines
    inputContent = inputContent . trim ( ) . split ( "\n" ) ;

    // Extract the primary numerical value from the first line
    const   primaryNumber   =   parseInt (   inputContent[0]   ) ;

    // Display the cubic value of the extracted number
    console . log (   primaryNumber   *   primaryNumber   *   primaryNumber   ) ;
}   ;

// Obtain textual data from the standard input stream and pass it for execution
executeProcessing (   require ( 'fs' ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;