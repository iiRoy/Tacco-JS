/*
 * This is a Type I clone of an original JavaScript program.
 * It demonstrates data processing related to room allocation or similar structures.
 * The core logic and identifiers are preserved exactly as in the original.
 */

( function (   stdin   ) {
    // Defines a utility function to create an array initialized with zeros.
    function makeArray ( n   ) {
        var arr = []; // Initialize an empty array.

        // Loop to populate the array with 'n' zeros.
        for ( var i = 0; i < n; i++  ) {
            arr.push(0);
        }

        return arr; // Return the newly created array.
    }


    /*
     * This function processes room data based on input values.
     * It modifies the 'room' structure in place.
     */
    function inRoomData  (   room , data   ) {
        // Iterate over each data entry and update the room structure.
        data.map(   function (   v   ) {
            // Accesses a specific location in the 3D 'room' array
            // and adds the fourth element of 'v' to it.
            room[ v[0] - 1 ][ v[1] - 1 ][ v[2] - 1 ]   +=   v[3];

            return v; // Return the original value for map, though side effect is primary.
        }   );

        return room; // Return the modified room structure.
    }


    // Read standard input, convert to string, trim whitespace, and split by newlines.
    var inputs = stdin . toString() . trim() . split('\n');

    // Parse the input lines into a 2D array of numbers.
    var manData = inputs . map (   function (   v   ) {
        return v . split(' ') . map(Number);
    }   );

    // Initialize a 3D array representing rooms.
    // Outer array has 4 elements, each containing an array of 3 elements,
    // which in turn contain arrays of 10 elements (all initialized to 0).
    var allRoom = makeArray(4) . map (   function (   ) {
        return makeArray(3) . map (   function (   ) {
            return makeArray(10);
        }   );
    }   );


    // Remove the first element from manData (often header/count info).
    manData . shift (   );

    // Call the processing function and log the final room data to console.
    console . log(   inRoomData(   allRoom , manData   )   );

}   )   (   require('fs') . readFileSync('/dev/stdin', 'utf8')   )   ;