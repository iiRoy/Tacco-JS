var LOWER_BOUND = 0,
    UPPER_BOUND = 9;

process.stdin.resume();

process.stdin.setEncoding( 'utf8' );

process.stdin.on( "data", function ( input_segment ) {

  var target_numbers = String( input_segment ) .trim() .split( "\n" ) .map( Number );

  var result_tally = 0;

  for ( var idx_val = 0; idx_val < target_numbers.length; idx_val++ ) {

    result_tally = 0;

    for ( var digit_a = LOWER_BOUND; digit_a <= UPPER_BOUND; digit_a++ ) {

      for ( var digit_b = LOWER_BOUND; digit_b <= UPPER_BOUND; digit_b++ ) {

        for ( var digit_c = LOWER_BOUND; digit_c <= UPPER_BOUND; digit_c++ ) {

          for ( var digit_d = LOWER_BOUND; digit_d <= UPPER_BOUND; digit_d++ ) {

            if ( digit_a + digit_b + digit_c + digit_d === target_numbers[idx_val] ) {

              result_tally++;

            }
          }
        }
      }
    }
    console.log( result_tally );

  }
} );