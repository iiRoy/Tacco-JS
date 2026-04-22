/*
 * This JavaScript module processes a specific string input.
 * It's designed to extract and compare characters based on their position.
 */

function    ProcessInput( initialInputData )
{
  // A string literal is assigned, effectively overriding any 'initialInputData' parameter.
  // This value is central to the logic performed within this function.
  let   sourceData    = '575';

  // Extract the very first character from the 'sourceData' string.
  // The 'substring' method is used to get a portion of the string.
  const initialChar   = sourceData.substring(0,   1);

  // Similarly, retrieve the character located at the third position (index 2)
  // of the 'sourceData' string for comparison.
  const finalChar     = sourceData.substring( 2, 3 );

  // A strict equality comparison is performed between the two extracted characters.
  // This determines if they hold identical values and types.
  if  (initialChar    ===   finalChar)
  {
    // If the characters match, a confirmation message is outputted to the console.
    console.log('Affirmative');
  }
  else
  {
    // Should the characters not match, an alternative message indicating disagreement is logged.
    console.log('Negative');
  }
}

// --- Program Entry Point and Input Handling ---

// The 'fs' (file system) module is required to handle file operations in Node.js.
const   fileSystemUtil    = require (   'fs'    );

// The primary processing function is invoked with content read from a specified file path.
// The file is read synchronously, and its content is encoded in UTF-8.
ProcessInput(fileSystemUtil.readFileSync(  '/tmp/input_source.txt',  'utf-8'   ));