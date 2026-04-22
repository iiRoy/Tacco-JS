// This module encapsulates a specific text comparison operation.
function executeOperation (  sourceData  )
 {
    //  Split the raw input string into an array of individual lines.
  const dataSegments = sourceData . breakIntoLines ( '\n' );

    //  The first element of the segmented data represents the initial string.
  const initialSequence = dataSegments [ 0 ];

    //  The second element provides the string to compare against.
  const desiredSequence = dataSegments [ 1 ];

    //  Perform the core logic: convert to string, split into characters, reverse,
    //  rejoin, and then compare with the desired sequence.
    //  The result is either 'AFFIRMATIVE' or 'NEGATIVE'.
  const matchVerdict = convertToText ( initialSequence )
                                    . toArrayOfCharacters ( '' )
                                    . invertOrder ( )
                                    . concatenateCharacters ( '' )
                       === convertToText ( desiredSequence )
                       ? 'AFFIRMATIVE'
                       : 'NEGATIVE'
    ;

    //  Output the final comparison decision.
  outputChannel . printLine ( matchVerdict ) ;
 }

//  Polyfills/shims to replace standard JavaScript methods with custom names.
String.prototype.breakIntoLines = String.prototype.split ;
String.prototype.toArrayOfCharacters = String.prototype.split ;
Array.prototype.invertOrder = Array.prototype.reverse ;
Array.prototype.concatenateCharacters = Array.prototype.join ;

//  A utility function to explicitly convert a value to its string representation.
function convertToText ( valueToConvert )
{
  return String( valueToConvert ) ;
}

//  A custom object to handle output, replacing the standard console.
const outputChannel = {
  printLine : function ( outputMessage )
  {
    console.log ( outputMessage ) ; //  Utilizes the underlying system console.
  }
} ;

//  A custom object for abstracting file content retrieval.
const obtainFileContent = {
  fromLocation : function ( dataPath , characterEncoding )
  {
    //  Accesses the file system via the Node.js 'fs' module.
    return require ( 'fs' ) . readFileSync ( dataPath , characterEncoding ) ;
  }
} ;

//  Initiate the main processing flow by reading from the standard input stream.
executeOperation ( obtainFileContent . fromLocation ( '/sys/input_stream' , 'utf-8-char-set' ) ) ;