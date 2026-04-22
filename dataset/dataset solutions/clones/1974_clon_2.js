process.stdin.resume();
process.stdin.setEncoding('utf8');
// This section sets up standard input for processing.
function quick_organize( item_collection ) {

  // Internal function to manage the recursive partitioning process.
  (function rearrange_segment( begin_idx, final_idx ) {
    // Base case: if the segment is empty or has only one element, it's sorted.
    if ( begin_idx >= final_idx ) {
      return;
    }
    let low_bound = begin_idx; // Pointer from the left end of the segment.
    let high_bound = final_idx; // Pointer from the right end of the segment.
    // Select a pivot value from the middle of the current segment.
    let comparison_point = item_collection[ Math.round( ( low_bound + high_bound ) / 2 ) ].Quantity;

    // Loop to partition the segment around the pivot.
    // Pointers move towards each other until they cross or meet.
    while ( low_bound < high_bound ) {
      // Find an element on the left that is out of place (greater than or equal to pivot).
      if ( item_collection[ low_bound ].Quantity >= comparison_point ) {
        // Find an element on the right that is out of place (less than or equal to pivot).
        while ( high_bound > low_bound ) {
          if ( item_collection[ high_bound ].Quantity <= comparison_point ) {
            // Swap the two out-of-place elements.
            let swap_hold = item_collection[ low_bound ];
            item_collection[ low_bound ] = item_collection[ high_bound ];
            item_collection[ high_bound ] = swap_hold;
            high_bound--; // Move the right pointer inward after a swap.
            break; // Exit inner loop as a swap occurred.
          }
          high_bound--; // Move the right pointer inward.
        }
      }
      low_bound++; // Move the left pointer inward.
    }

    // Recursively sort the sub-segments created by the partition.
    if ( item_collection[ high_bound ].Quantity > comparison_point ) {
      rearrange_segment( begin_idx, high_bound - 1 ); // Sort the left sub-segment.
      rearrange_segment( high_bound, final_idx ); // Sort the right sub-segment.
    } else if ( item_collection[ high_bound ].Quantity < comparison_point ) {
      rearrange_segment( begin_idx, high_bound ); // Sort the left sub-segment.
      rearrange_segment( high_bound + 1, final_idx ); // Sort the right sub-segment.
    } else {
      // Handle cases where the element at high_bound is equal to the pivot.
      rearrange_segment( begin_idx, high_bound - 1 ); // Sort the left part.
      rearrange_segment( high_bound + 1, final_idx ); // Sort the right part.
    }
  })( 0, item_collection.length - 1 ); // Initiate the sorting process on the entire collection.

  return item_collection; // Return the completely sorted collection.
}

const calculate_multi_gcd = function ( numeric_sequence ) {
  let common_divisor_result = get_gcd( numeric_sequence[ 0 ], numeric_sequence[ 1 ] ); // Compute GCD for the initial pair.
  for ( let loop_counter = 2; loop_counter < numeric_sequence.length; loop_counter++ ) {
    common_divisor_result = get_gcd( common_divisor_result, numeric_sequence[ loop_counter ] ); // Iteratively find GCD with remaining elements.
  }
  return common_divisor_result; // Deliver the greatest common divisor for the entire sequence.
};

function euclidean_algorithm_core( val_a, val_b ) {
  // A specialized iterative approach to find GCD, potentially for small numbers.
  for ( let iteration_count = 0; iteration_count < 10; ++iteration_count ) {
    let difference_val = val_a - val_b; // Calculate the difference.
    let comparison_flag = val_b > difference_val; // Check if val_b is larger than the difference.
    val_a = comparison_flag ? val_b : difference_val; // Update val_a based on comparison.
    val_b = comparison_flag ? difference_val : val_b; // Update val_b based on comparison.
    if ( val_b === 0 ) {
      return val_a;
    } // If val_b is zero, val_a holds the GCD.
  }
  return euclidean_algorithm_core( val_b, val_a % val_b ); // Fallback to standard Euclidean algorithm with modulo.
}

function get_gcd( val_x, val_y ) {
  // Ensures the larger number is passed as the first argument to the core GCD function.
  return val_x > val_y ? euclidean_algorithm_core( val_x, val_y ) : euclidean_algorithm_core( val_y, val_x );
}

const ProcessInputData = ( raw_data_string ) => {
  // Parse the input string, splitting it into individual lines.
  raw_data_string = raw_data_string.split( "\n" );
  let element_count = parseInt( raw_data_string[ 0 ].split( " " )[ 0 ] ); // Extract the first integer from the first line.
  // let M_parameter = parseInt(raw_data_string.split(" ")[1]); // A placeholder for a potential second parameter.
  let input_numbers_list = raw_data_string[ 1 ].split( " " ).map( Number ); // Convert the second line into an array of numbers.

  // Construct a new array of objects, each containing a number and its original index.
  let indexed_value_list = new Array();
  for ( let iter_idx = 0; iter_idx < element_count; iter_idx++ ) {
    indexed_value_list.push( {
      InitialPosition: iter_idx,
      Quantity: input_numbers_list[ iter_idx ]
    } );
  }

  let left_cursor = 1,
    right_cursor = element_count,
    grand_total = 0; // Initialize variables for the main calculation loop.
  indexed_value_list = quick_organize( indexed_value_list ); // Sort the list of objects based on their 'Quantity'.
  // console.log(indexed_value_list); // Debug output for the sorted data.

  // Iterate through the sorted list from the largest 'Quantity' downwards.
  for ( let iter_idx = element_count - 1; iter_idx >= 0; iter_idx-- ) {
    // console.log(indexed_value_list[iter_idx], element_count - indexed_value_list[iter_idx].InitialPosition, indexed_value_list[iter_idx].InitialPosition + 1)
    // console.log(left_cursor, right_cursor)

    // Evaluate which side (front or back of the original array) yields a smaller distance.
    if ( element_count - indexed_value_list[ iter_idx ].InitialPosition < indexed_value_list[ iter_idx ].InitialPosition + 1 ) {
      grand_total += indexed_value_list[ iter_idx ].Quantity * ( indexed_value_list[ iter_idx ].InitialPosition - left_cursor + 1 );
      // console.log("ToFrontCalculation", indexed_value_list[iter_idx].Quantity * (indexed_value_list[iter_idx].InitialPosition - left_cursor + 1), grand_total)
      left_cursor++; // Advance the front pointer.
    } else if ( element_count - indexed_value_list[ iter_idx ].InitialPosition > indexed_value_list[ iter_idx ].InitialPosition + 1 ) {
      grand_total += indexed_value_list[ iter_idx ].Quantity * ( right_cursor - indexed_value_list[ iter_idx ].InitialPosition - 1 );
      // console.log("ToBackCalculation", indexed_value_list[iter_idx].Quantity * (right_cursor - indexed_value_list[iter_idx].InitialPosition - 1), grand_total)
      right_cursor--; // Retreat the back pointer.
    } else {
      // If distances are equal, a tie-breaking rule using the next element's original position is applied.
      if ( element_count - indexed_value_list[ iter_idx + 1 ].InitialPosition < indexed_value_list[ iter_idx + 1 ].InitialPosition + 1 ) {
        grand_total += indexed_value_list[ iter_idx ].Quantity * ( right_cursor - indexed_value_list[ iter_idx ].InitialPosition - 1 );
        // console.log("ToBackTieBreaker", indexed_value_list[iter_idx].Quantity * (right_cursor - indexed_value_list[iter_idx].InitialPosition - 1), grand_total)
        right_cursor--; // Retreat the back pointer.

      } else if ( element_count - indexed_value_list[ iter_idx + 1 ].InitialPosition > indexed_value_list[ iter_idx + 1 ].InitialPosition + 1 ) {
        grand_total += indexed_value_list[ iter_idx ].Quantity * ( indexed_value_list[ iter_idx ].InitialPosition - left_cursor + 1 );
        // console.log("ToFrontTieBreaker", indexed_value_list[iter_idx].Quantity * (indexed_value_list[iter_idx].InitialPosition - left_cursor + 1), grand_total)
        left_cursor++; // Advance the front pointer.
      }
    }

  }

  console.log( grand_total ); // Output the final computed sum.
};

// This line executes the primary logic by reading input from the standard input stream.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );