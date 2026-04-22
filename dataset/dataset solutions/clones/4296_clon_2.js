// This segment handles reading input data from a file system source.
let    inputDataStream    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) . split ( '\n' ) [ 0 ] . split ( ' ' ) ;

// Convert the initial string element from the processed input into a numeric type.
let    numericValOne    =    Number ( inputDataStream [ 0 ] ) ;

// The second element is also parsed as a numeric value from the input sequence.
let    numericValTwo    =    Number ( inputDataStream [ 1 ] ) ;

// The third element in the input sequence undergoes similar numeric conversion.
let    numericValThree    =    Number ( inputDataStream [ 2 ] ) ;

/*
 * This block outputs a specific numeric value based on a comparison logic:
 * If the first two values are identical, the third value is chosen.
 * Otherwise, if the first and third values are identical, the second value is chosen.
 * In any other case, the first value is the selected output.
 */
console . log ( numericValOne === numericValTwo
                ? numericValThree
                : numericValOne === numericValThree
                  ? numericValTwo
                  : numericValOne
              ) ;