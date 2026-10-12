// This function determines if the substring "hi" is present in the input.
( function checkString ( textData ) {
  // Perform a regular expression match for "hi" within the provided text.
  return textData . match ( /hi/ )
    ? 'Yes'
    : 'No' ;
} ) (
  // Synchronously read the entire content from standard input, encoded as UTF-8.
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;
