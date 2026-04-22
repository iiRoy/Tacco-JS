/*
 * This JavaScript module defines a primary function
 * to process incoming textual data.
 */
function  ExecuteProgram (  sourceContent  )
{
    // The core operation involves extracting a specific segment
    // from the provided textual input. It identifies the last occurrence
    // of the string "FESTIVAL" and retrieves all characters preceding it.
    // The resulting substring is then outputted to the standard console stream.
    console  .  log (  sourceContent  .  slice (  0  ,  sourceContent  .  lastIndexOf (  "FESTIVAL"  )  )  ) ;
}

// Here, the primary execution flow is initiated.
// It involves reading data from a specified standard input path
// using the Node.js file system module,
// ensuring the content is interpreted as UTF-8 encoded text.
// This retrieved data is then passed as an argument to the main processing function.
ExecuteProgram (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;