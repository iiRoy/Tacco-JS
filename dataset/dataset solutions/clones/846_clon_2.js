var dataSource = require('fs') .  readFileSync( '/dev/stdin' ,  'utf8' ) ;

var parsedContent = ( dataSource . trim() ) . replace( /red/g , "R" ) . replace( /blue/g , "B" ) ; // Standardize keywords to single characters

while ( /RR/ . test ( parsedContent ) ) // Simplify consecutive 'R' patterns
{
    parsedContent = parsedContent . replace( /RR/ , "RVR" ) ;
}

while ( /BB/ . test ( parsedContent ) ) { // Simplify consecutive 'B' patterns
    parsedContent = parsedContent . replace( /BB/ , "BVB" ) ;
}

var componentParts = parsedContent . split ( "V" ) ; // Divide the string into distinct segments

var dominantPart = "" ; // Variable to store the longest segment found

componentParts . forEach ( function ( currentSection ) { // Iterate through each segment
   if  ( dominantPart . length < currentSection . length ) // Check if the current segment is longer
   {
       dominantPart = currentSection ; // Update the dominant segment
   }
} ) ;

console . log ( ( dominantPart . slice ( -1 ) == "R" ) ? "red" : "blue" ) ; // Determine the final output based on the dominant segment's last character