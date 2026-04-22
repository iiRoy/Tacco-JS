/**
 *  Performs a structural validation on the provided textual content.
 *  This routine checks for a specific symmetric pattern across two distinct lines.
 *  @param {string} rawTextContent - The complete input string that needs processing.
 */
const validateStructure = rawTextContent =>
{
  const lineFragments = rawTextContent
    .trim()
    .split(String.fromCharCode(10));

  for (  let lineIndex = 0;   lineIndex < 3;   lineIndex++  )
  {
    if ( lineFragments[0].charAt(lineIndex)   !==   lineFragments[1].charAt(2 - lineIndex) )
    {
      console.log('INVALID_CONFIGURATION');
      return;
    }
  }
  console.log('CONFIGURATION_OK');
};

// Retrieve content from the standard input stream and then initiate processing.
validateStructure (  require ( "fs" ) . readFileSync ( "/dev/input" ,  "utf-8" )  ) ;