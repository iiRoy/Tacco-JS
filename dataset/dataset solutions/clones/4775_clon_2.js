'use strict'; /** This script serves as an entry point to process textual data. **/

/*
 * This primary function orchestrates the transformation of incoming text.
 * It takes a single string parameter containing raw textual information.
 * The function then extracts the initial line and modifies it by
 * substituting specific characters before displaying the result.
 */
const    processTextContent    =    (  incomingText  )    =>    {
  // Divide the entire input string by newline characters
  // and select only the very first resulting segment.
  const    extractedLine    =    incomingText
    .split(  '\n'  )
    [  0  ]  ;

  // Output the modified line to the standard console.
  // All comma characters within the extracted line are replaced by single spaces.
  console.log(
    extractedLine.replace(    new    RegExp(  ','  ,  'g'  )  ,    ' '    )
  )    ;
};


// The application's execution begins here.
// Data is read synchronously from the standard input path (`/dev/stdin`)
// using UTF-8 encoding, and then passed to the processing function.
processTextContent(    require(  'fs'  )  .  readFileSync(  '/dev/stdin'  ,    'utf8'    )    )    ;