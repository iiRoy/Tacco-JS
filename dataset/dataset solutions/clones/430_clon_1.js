/*
 * This JavaScript code processes input from stdin to simulate
 * a seating arrangement problem.
 * It reads commands and modifies an array representing seats.
 */
var input=require('fs') .readFileSync('/dev/stdin', 'utf8'); // Read entire input from /dev/stdin as UTF-8.
var Arr = input.trim() .split("\n");                               // Trim whitespace and split by newline into an array.


while ( true )
{
    // Begin processing a new set of N and M values
    var nm = Arr.shift() .split(" ") .map( Number ); // Extract N and M from the first line of the current block.
    var n = nm[0];                                   // N represents the number of seats.
    var m = nm[1];                                   // M represents the number of operations.

    /*
     * If both N and M are zero, it signals the end of input.
     * Terminate the processing loop.
     */
    if ( n == 0 && m == 0 )
        break;

    // Initialize the array representing the seats.
    var arr = [ ];
    // Populate the array with '0' for empty seats, based on N.
    for ( var i = 0; i < n; i++ )
        arr.push( 0 );

    // Add sentinels 'X' at both ends of the array for boundary checks.
    arr.unshift( "X" );
    arr.push( "X" );


    // Process M operations for the current N seats.
    for ( var I = 0; I < m; I++ )
    {
        var v = Arr.shift(); // Get the current operation type (A, B, C, or D).

        if ( v == "A" )
        {
            // Operation A: Find the first empty seat from the left and place 'A'.
            for ( var i = 1; i < arr.length - 1; i++ )
            {
                if ( arr[i] == 0 )
                {
                    arr[i] = "A"; // Assign 'A' to the empty seat.
                    break;        // Only one 'A' is placed per operation.
                }
            }
        }

        if ( v == "B" )
        {
            // Operation B: Try to find an empty seat '0' that is not adjacent to 'A' (i.e., 'X0X' or 'B0X' or 'X0B').
            var flag = false; // Flag to check if a suitable seat was found.
            for ( var i = arr.length - 2; i >= 1; i-- )
            {
                /*
                 * Check conditions for placing 'B':
                 * - The seat itself is empty (arr[i] == 0).
                 * - The seat to its left is not 'A' (arr[i-1] != "A").
                 * - The seat to its right is not 'A' (arr[i+1] != "A").
                 */
                if ( arr[i-1] != "A" && arr[i] == 0 && arr[i+1] != "A" )
                {
                    arr[i] = "B";  // Place 'B'.
                    flag = true;   // Set flag to true.
                    break;         // Exit the loop as 'B' is placed.
                }
            }
            if ( flag )
                continue; // If 'B' was placed under specific conditions, move to the next operation.

            // If no such seat was found, place 'B' in the first available empty seat from the left.
            for ( var i = 1; i < arr.length - 1; i++ )
            {
                if ( arr[i] == 0 )
                {
                    arr[i] = "B"; // Place 'B' in the first empty seat.
                    break;        // Exit loop.
                }
            }
        }

        if ( v == "C" )
        {
            // Operation C: Find an occupied seat and place 'C' next to it in an empty spot.
            var flag = false; // Flag to indicate if 'C' was placed.
            for ( var i = 1; i < arr.length - 1; i++ )
            {
                if ( arr[i] != 0 ) // If the current seat is occupied...
                {
                    if ( arr[i+1] == 0 ) // Check if the seat to its right is empty.
                    {
                        arr[i+1] = "C"; // Place 'C' there.
                        flag = true;    // Set flag.
                        break;          // Exit loop.
                    }
                    else if ( arr[i-1] == 0 ) // Otherwise, check if the seat to its left is empty.
                    {
                        arr[i-1] = "C"; // Place 'C' there.
                        flag = true;    // Set flag.
                        break;          // Exit loop.
                    }
                }
            }
            if ( flag )
                continue; // If 'C' was placed, move to the next operation.

            // If no adjacent empty seat was found, place 'C' in the middle.
            if ( n % 2 == 1 )
                arr[(n-1)/2+1] = "C"; // Odd number of seats, place in the exact middle.
            else
                arr[n/2+1] = "C";     // Even number of seats, place to the right of the two middle seats.
        }

        if ( v == "D" )
        {
            // Operation D: Find the largest contiguous block of empty seats and place 'D' in its center.
            var max = [0, 0]; // [index_of_center, max_length_of_empty_block].

            // Iterate through all seats to find empty blocks.
            for ( var i = 1; i < arr.length - 1; i++ )
            {
                if ( arr[i] != 0 )
                    continue; // Skip if seat is not empty.

                var jA = i; // Left pointer for expanding the empty block.
                var jB = i; // Right pointer for expanding the empty block.
                var cnt = 0; // Current length of the empty block.

                while ( true )
                {
                    if ( arr[jA] != "X" ) jA--; // Move left if not boundary.
                    if ( arr[jB] != "X" ) jB++; // Move right if not boundary.

                    if ( arr[jA] == "X" && arr[jB] == "X" ) break; // Both boundaries reached.
                    if ( arr[jA] != "X" && arr[jA] != 0 ) break; // Left boundary is occupied.
                    if ( arr[jB] != "X" && arr[jB] != 0 ) break; // Right boundary is occupied.

                    cnt++; // Increment count for each step.
                    if ( max[1] < cnt )
                        max = [i, cnt]; // Update max if current block is larger.
                }
            }

            // After checking all possible empty blocks.
            if ( max[0] != 0 && max[1] != 0 )
            {
                arr[max[0]] = "D"; // Place 'D' in the center of the largest block.
            }
            else
            {
                // If no suitable block was found (or all seats are occupied),
                // place 'D' in the first available empty seat from the left.
                for ( var i = 1; i < arr.length - 1; i++ )
                {
                    if ( arr[i] == 0 )
                    {
                        arr[i] = "D"; // Place 'D' here.
                        break;        // Exit loop.
                    }
                }
            }
        }
    }

    // Remove the sentinel 'X' characters from both ends before printing.
    arr.shift();
    arr.pop();

    // Join the array elements into a string and replace '0' (empty seats) with '#'.
    var str = arr.join("") .replace( /0/g, "#" );
    console.log( str ); // Output the final seating arrangement.
}