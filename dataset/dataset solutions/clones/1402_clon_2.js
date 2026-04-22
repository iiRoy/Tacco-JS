// Obtain all raw input content from the standard input source
let   rawData   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Clean up leading/trailing whitespace and segment the full content into an array of text lines
const   lines   =   rawData . trim ( ) . split ( "\n" ) ;

// Isolate the second line, split it by spaces, transform each part into a numerical value, then arrange them in ascending sequence
let   sortedNumbers   =   lines [ 1 ] . split ( " " ) . map ( Number ) . sort ( function ( firstVal ,   secondVal ) {
    return   firstVal   -   secondVal ;
} ) ;

// Display the final collection of sorted numbers, concatenated with a single space character
console . log ( sortedNumbers . join ( ' ' ) ) ;