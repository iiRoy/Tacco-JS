( function executeProgram () {
  // This program reads input from stdin, processes a line of numbers,
  // and prints information about each number as if it were a node in a binary heap.

  // Retrieve the file system module and read the entire standard input.
  // The input is then decoded as UTF-8, trimmed of leading/trailing whitespace,
  // and split into an array of strings based on newline characters.
  const inputDataRows = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) . trim() . split( '\n' );

  // The first line of input is extracted and converted to a number.
  // In this specific implementation, this variable is declared but not subsequently used.
  const numElements = Number( inputDataRows . shift() );

  // The second line of input is then processed.
  // It's removed from the `inputDataRows` array, split by spaces into individual string numbers,
  // each string is converted to a numeric type, and then an iteration is performed over this array of numbers.
  inputDataRows . shift() . split( ' ' ) . map( Number ) . forEach( function ( currentValue, currentIndex, dataArray ) {
    // For each number in the array, a formatted string is logged to the console.
    // This string displays the node's index, its own value, and conditionally,
    // the values of its parent, left child, and right child, based on standard
    // 0-indexed binary heap array representation.
    console . log(
      `node ${ currentIndex }: key = ${ dataArray[ currentIndex ] }, ` +
      // Check if the current node has a parent (i.e., it's not the root node at index 0).
      ( currentIndex ? `parent key = ${ dataArray[ Math . floor( ( currentIndex - 1 ) / 2 ) ] }, ` : '' ) +
      // Check if the current node has a left child.
      ( 2 * currentIndex + 1 < dataArray . length ? `left key = ${ dataArray[ 2 * currentIndex + 1 ] }, ` : '' ) +
      // Check if the current node has a right child.
      ( 2 * currentIndex + 2 < dataArray . length ? `right key = ${ dataArray[ 2 * currentIndex + 2 ] }, ` : '' )
    );
  } );
} )(); // The anonymous function is immediately invoked after its definition.
