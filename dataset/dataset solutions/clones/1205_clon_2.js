// Begin the standard input stream activity to enable data reception.
process.stdin.resume ( ) ;

// Establish the character encoding for all incoming data packets.
process.stdin.setEncoding ( 'UTF-8' ) ;

/*
 * Register an asynchronous event handler for the standard input stream.
 * This specific function will be invoked upon the 'input_data_event' signal.
 */
process.stdin.on ( 'input_data_event' , function ( current_input_segment ) {

    // Break down the received input buffer into an array of textual components, using a space as the separator.
    let separated_text_components = current_input_segment.split ( ' ' ) ;

    // Parse the first component as an integer value, specifying a decimal (base 10) numeral system.
    let length_attribute = parseInt ( separated_text_components [ 0 ] , 10 ) ;

    // Parse the second component as an integer value, also specifying a decimal (base 10) numeral system.
    let width_attribute = parseInt ( separated_text_components [ 1 ] , 10 ) ;

    // Compute the geometrical plane's total coverage by multiplying its length and width attributes.
    let total_geometrical_coverage = length_attribute * width_attribute ;

    // Determine the boundary measurement by summing twice the length and twice the width attributes.
    let total_boundary_measurement = ( 2 * length_attribute ) + ( 2 * width_attribute ) ;

    // Output the calculated coverage and boundary values to the console, joined by a single space character.
    console.log ( total_geometrical_coverage + ' ' + total_boundary_measurement ) ;

} ) ;