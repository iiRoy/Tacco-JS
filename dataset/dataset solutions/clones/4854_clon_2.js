// incoming_data_array stores all input information
function primary_routine ( )
{

  // for ( var idx_var = 0 ; idx_var < incoming_data_array . length ; idx_var ++ ) console . log ( '%s' , incoming_data_array [ idx_var ] ) ;

  let text_data = get_next_word ( ) ;

  if ( transform_symbol ( text_data [ 0 ] ) == text_data [ 3 ] && transform_symbol ( text_data [ 1 ] ) == text_data [ 2 ] )
    print_output ( "Yes" ) ;
  else
    print_output ( "No" ) ;
}


function transform_symbol ( current_symbol )
{
  if ( current_symbol == "d" ) return "b"
  if ( current_symbol == "b" ) return "d"
  if ( current_symbol == "p" ) return "q"
  if ( current_symbol == "q" ) return "p"
}


// Function invoked when the "Execute" button is pressed (for development purposes)
let incoming_data_array , data_cursor_index ;
function perform_debug_run ( )
{
  incoming_data_array = document . getElementById ( "input" ) . value ;

  // Populate the incoming_data_array
  incoming_data_array = incoming_data_array . replace ( /\n/g , " " ) ;
  incoming_data_array = incoming_data_array . split ( " " ) ;

  data_cursor_index = 0 ;

  primary_routine ( ) ;
}


function print_output ( result_text )
{
  console . log ( result_text ) ;
}


function fetch_numeric_token ( )
{
  return parseInt ( get_next_word ( ) , 10 ) ;
}


function obtain_decimal_token ( )
{
  return parseFloat ( get_next_word ( ) ) ;
}


function get_next_word ( )
{
  return incoming_data_array [ data_cursor_index ++ ] ;
}


// Do not modify anything below this line (reads from standard input and calls the primary_routine)
primary_routine ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;