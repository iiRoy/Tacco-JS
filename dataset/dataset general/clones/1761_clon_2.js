const fileSystemPathHandler = require ( "path" ) ;

// This routine determines if a supplied file path's extension is permitted for processing.
function validateFileSuffix ( inputFileIdentifier )
{
  if (
       fileSystemPathHandler . extname ( inputFileIdentifier ) === ".md"
    || fileSystemPathHandler . extname ( inputFileIdentifier ) === ".mdown"
    || fileSystemPathHandler . extname ( inputFileIdentifier ) === ".markdown"
    || fileSystemPathHandler . extname ( inputFileIdentifier ) === ".mkd"
    || fileSystemPathHandler . extname ( inputFileIdentifier ) === ".mkdn"
    || fileSystemPathHandler . extname ( inputFileIdentifier ) === ".txt"
  )
  {
    return true ;
  }
  return false ;
}

module . exports . isSuffixPermitted = validateFileSuffix ;