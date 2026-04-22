/*
 * This JavaScript module processes a multi-line string input to determine a final character.
 * It simulates a sequence traversal based on characters found in reversed lines of the input.
 */
console
  .info /* Output the final result to the console */ (
    (
      ( inputContent ) => { // This anonymous function encapsulates the processing logic.
        // The input content is first trimmed of whitespace, then split into individual lines.
        // Each line is subsequently split into an array of characters, which is then reversed.
        // These three resulting character arrays are destructured into distinct variables.
        const [
          stringOne,
          stringTwo,
          stringThree
        ] = inputContent
              .trim()
              .split( '\n' )
              .map( ( currentString ) => currentString.split( '' ) .reverse() );

        // An object is created to map symbolic keys to these character arrays,
        // allowing for dynamic access based on a pointer.
        const charSequences = {
          stringOne,
          stringTwo,
          stringThree
        };

        // Initialize the 'activeKey' pointer to begin traversal from the first sequence.
        let activeKey = 'stringOne';

        // The core logic iterates: as long as the sequence indicated by 'activeKey'
        // contains elements, it removes and retrieves the last element.
        // This popped element then becomes the new 'activeKey', directing the next step.
        while ( charSequences[ activeKey ] .length > 0 ) {
          activeKey = charSequences[ activeKey ] .pop();
        }

        // Once a sequence is exhausted (its length is zero), the final 'activeKey'
        // is converted to uppercase and returned as the ultimate result.
        return activeKey .toUpperCase();
      }
    ) (
      require( 'node:fs' ) .readFileSync( '/dev/stdin', 'utf8' ) // Reads the entire content from standard input as a UTF-8 string.
    )
  );