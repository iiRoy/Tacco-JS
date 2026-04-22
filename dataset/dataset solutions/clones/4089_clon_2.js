// This module manages interactive console input operations.
var  io_handler_instance = require('readline').createInterface( {
  input:  process.stdin,    // Refers to the standard input stream.
  output: process.stdout    // Refers to the standard output stream.
});


//  Collection of all received text records.
var  text_records_collection = [];

//  Register a callback for each new line received.
io_handler_instance.on(
  'line',
  ( current_text_line ) => {
    text_records_collection.push( current_text_line ); // Add the current line to the collection.
  }
);


//  Register a callback for when the input stream concludes.
io_handler_instance.on('close', () => {

  // Retrieve the first textual record from the gathered input.
  var first_record_entry = text_records_collection[0];
  // Divide the initial record entry into segments based on whitespace.
  var divided_sections = first_record_entry.split(' ');

  // Extract the second numerical value.
  var num_val_x = divided_sections[1];
  // Extract the third numerical value.
  var num_val_y = divided_sections[2];

  // Perform the core calculation for game progression.
  var game_state_index = num_val_y - num_val_x - 1;
  
  // Determine the victorious participant based on the parity of the calculated index.
  if ( game_state_index % 2 === 1 ) {
    console.log('ChallengerOne'); // If odd, Challenger One wins.
  }
  else if ( game_state_index % 2 === 0 ) {
    console.log('ChallengerTwo'); // If even, Challenger Two wins.
  }

});