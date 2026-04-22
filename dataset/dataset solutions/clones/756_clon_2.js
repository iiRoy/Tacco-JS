/*
 *  This program reads input from standard input,
 *  generates an arithmetic sequence,
 *  performs a series of operations on it,
 *  and finally outputs a specific element.
 */


var getModule = require;

// Retrieve all content from the designated input file path.
var fileContent = getModule('fs') . readFileSync (
    '/dev/stdin',
    'utf8'
);


// Process the raw input: trim whitespace and split into an array of lines.
var lineArray = fileContent . trim ( ) . split ( "\n" ) ;


// The very first line specifies the total number of elements for our sequence.
var countElements = parseInt ( lineArray . shift ( ) ) ;


// The second line provides the initial term and the common difference.
var [ startValue , difference ] = lineArray . shift ( ) . split ( " " ) . map ( parseInt ) ;


// Initialize an empty array that will store our arithmetic progression.
var sequenceResult = [ ] ;


// Populate the sequence with 'countElements' terms.
for ( var idx = 0 ;
      idx < countElements ;
      idx++
) {
    sequenceResult . push ( startValue + idx * difference ) ;
}


// The next line indicates how many modification operations are to be performed.
var operationNum = parseInt ( lineArray . shift ( ) ) ;


// Iterate through each specified operation.
for ( var opCounter = 0 ; opCounter < operationNum ; opCounter ++ )
{
    // Each operation consists of an action type and two 1-based indices.
    var [ actionType , firstPos , secondPos ] = lineArray . shift ( ) . split ( " " ) . map ( parseInt ) ;

    // If the action type is 0, swap the elements at the two given positions.
    if ( actionType === 0 )
    {
        [ sequenceResult [ firstPos - 1 ] ,
          sequenceResult [ secondPos - 1 ] ] =
        [ sequenceResult [ secondPos - 1 ] ,
          sequenceResult [ firstPos - 1 ] ] ;
    }
    // Otherwise, assign the value from the second position to the first position.
    else
    {
        sequenceResult [ firstPos - 1 ] = sequenceResult [ secondPos - 1 ] ;
    }
}


// The final line of input specifies the 1-based index of the element to output.
var finalIndex = parseInt ( lineArray . shift ( ) ) ;


// Display the value of the element at the calculated final index to the console.
console . log ( sequenceResult [ finalIndex - 1 ] ) ;