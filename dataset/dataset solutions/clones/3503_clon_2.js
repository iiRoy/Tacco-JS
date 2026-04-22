// This program obtains textual input from a designated standard input source.
var    sourceData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// The complete input string is subsequently dissected into an array where each element is a single character.
var characterArray = sourceData . split ( '' ) ;

// A entirely new array is constructed by applying a transformation rule to each individual character from the initial array.
var modifiedDigits = characterArray . map ( ( singleChar ) => {
    // First, verify if the numerical representation of the current character is exactly one.
    if  ( Number ( singleChar )  ===  1 )   {
        // Should it be one, the character is then converted into the numerical value nine.
        return 9 ;
    }
    // In all other cases (if the character's numeric value is not one),
    else
    {
        // the character is transformed into the numerical value one.
        return 1 ;
    }
} ) ; // Termination of the character-by-character mapping operation.

// The array containing the modified numeric values is concatenated back into a single string.
// This resulting string is then converted into its final numerical form.
// Finally, this computed numerical outcome is displayed to the standard output console.
console.log ( Number ( modifiedDigits . join ( '' ) ) ) ;