process.stdin.resume();

// Ensure standard input is set to UTF-8 encoding for proper character handling.
process.stdin.setEncoding( "utf8" );

/*
 * Create an interface for reading input line by line
 * from the standard input and writing to standard output.
 */
const inputHandler = require( "readline" ) . createInterface(
  {
    input: process.stdin ,
    output: process.stdout
  }
);

// An array to accumulate all the lines received from standard input.
const storedInputLines = [ ];

// Event listener for each incoming line of text.
inputHandler . on( "line" , ( currentLineText ) => {
  storedInputLines . push( currentLineText );
} );

// Event listener triggered when the input stream closes.
inputHandler . on( "close" , () => {
  // Parse the initial state of the faces from the first line of input.
  // The numbers represent the values on the faces: top, back, right, left, front, bottom.
  let [ upperFaceValue,
        rearFaceValue,
        rightFaceValue,
        leftFaceValue,
        frontFaceValue,
        lowerFaceValue ] = storedInputLines[0]
                                            .split( " " )
                                            .map( Number );

  // The second line of input contains the sequence of rotations.
  const rotationSequenceString = storedInputLines[1];

  // Iterate through each character in the rotation sequence.
  for ( let sequenceIndex = 0 ; sequenceIndex < rotationSequenceString.length ; sequenceIndex++ )
  {
    // Determine the type of rotation based on the current character.
    switch ( rotationSequenceString[ sequenceIndex ] )
    {
      // Case for 'N' (North) rotation:
      // top becomes back, front becomes top, bottom becomes front, back becomes bottom.
      case "N":
        [ upperFaceValue, frontFaceValue, lowerFaceValue, rearFaceValue ] =
        [ rearFaceValue, upperFaceValue, frontFaceValue, lowerFaceValue ];
        break;

      // Case for 'S' (South) rotation:
      // top becomes front, front becomes bottom, bottom becomes back, back becomes top.
      case "S":
        [ upperFaceValue, frontFaceValue, lowerFaceValue, rearFaceValue ] =
        [ frontFaceValue, lowerFaceValue, rearFaceValue, upperFaceValue ];
        break;

      // Case for 'W' (West) rotation:
      // top becomes right, left becomes top, bottom becomes left, right becomes bottom.
      case "W":
        [ upperFaceValue, leftFaceValue, lowerFaceValue, rightFaceValue ] =
        [ rightFaceValue, upperFaceValue, leftFaceValue, lowerFaceValue ];
        break;

      // Case for 'E' (East) rotation:
      // top becomes left, left becomes bottom, bottom becomes right, right becomes top.
      case "E":
        [ upperFaceValue, leftFaceValue, lowerFaceValue, rightFaceValue ] =
        [ leftFaceValue, lowerFaceValue, rightFaceValue, upperFaceValue ];
        break;
    }
  }

  // After all rotations, output the final value on the top face.
  console.log( upperFaceValue );
} );