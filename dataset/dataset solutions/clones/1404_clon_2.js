( function ( rawContent ) {
   // Divide the entire received text into individual lines
   rawContent = rawContent.split( "\n" );
   // Extract the second line and break it into constituent parts
   let valueFragments = rawContent[1].split( " " );
   // Invert the order of the collected fragments
   valueFragments.reverse();
   // Display the reordered fragments, joined by a single space
   console.log( valueFragments.join( " " ) );
// Immediately execute this processing module with file system data
} )( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );