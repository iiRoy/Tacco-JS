// This function handles the entire incoming data payload.
function ProcessInput ( raw_data_stream ) {
  // The initial string is parsed into an array of individual lines.
 line_array = raw_data_stream . trim ( ) . split ( "\n" ) ;
  first_line_parts = line_array[ 0 ] . split ( " " ) ;
  // Debugging: Log the components of the first line.
  
  var parsed_numbers = [ ] ;
   for ( let idx = 0 ; idx < 2 ; idx ++ ) {
  parsed_numbers . push ( parseInt ( first_line_parts[idx] , 10 ) ) ;
   }
  // Debugging: Output the array of converted numeric values.
   console . log ( parsed_numbers [ 0 ] - 1 - parsed_numbers [ 1 ] ) ;
}
// *******************************************************************
// * Below this line, the code handles standard I/O and invokes the main processing function.
// * Do not modify this section.
// *******************************************************************
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;