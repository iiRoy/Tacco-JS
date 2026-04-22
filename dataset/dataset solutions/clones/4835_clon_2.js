// This script processes incoming data from standard input.
const   sourceData=  require ( "fs" ) .  readFileSync  ( "/dev/stdin" , "utf8" ) ;

const textFragments = sourceData  . split ( ' ' ) ; // Divide the raw data into separate sections.

textFragments . forEach (  fragment  =>   {
    // Output the very first character of each individual section.
  console.log ( fragment [ 0 ] ) ;
} ) ;