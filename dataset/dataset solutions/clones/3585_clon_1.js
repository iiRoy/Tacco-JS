"use strict"; /* This directive enforces strict parsing and error handling in the script. */

// Define the main function that processes the input argument.
function main(  arg  ) {

    // Trim any leading or trailing whitespace from the input string.
    arg = arg.trim()  ;

    /*
     * Parse the input to extract grid dimensions and tile data.
     * The input format is expected to be: "Y X\ntile_row1\ntile_row2\n..."
     */
    const   X     =   parseInt(  arg.split("\n")[0].split(" ")[1]  ); // Extract the width (X) from the first line.
    const   Y     =   parseInt(  arg.split("\n")[0].split(" ")[0]  ); // Extract the height (Y) from the first line.
    const   tiles =   arg.split("\n").slice(  1,arg.length-1  )  ; // Extract the tile rows, skipping the first line and potentially the last if it's empty.

    // Initialize an array to store the indices of rows that do not contain any '#' character.
    let   target =   [ ]  ;

    // Loop through each row of the tiles to identify rows to be removed.
    for (  let   i = 0  ;   i <= Y  ;   i++  ) {

        // Check if the current row 'tiles[i]' does not contain the '#' character.
        if  (  tiles[i].indexOf("#")   ===   -1  )   {

            // If no '#' is found, add the row index to the 'target' array.
            target.push(  i  )  ;
        }
    }


    // Remove the identified rows from the 'tiles' array.
    // Iterate backwards to avoid issues with changing array indices during removal.
    for (  let   i = target.length - 1  ;   i >= 0  ;   i--  ) {

        // Use splice to remove one element at the specified index.
        tiles.splice(  target[i],   1  )  ;
    }


    // Now, process columns.
    // Loop through each potential column index from 0 to X-1.
    for (  let   i = 0  ;   i < X  ;   i++  ) {

        // Create a temporary array to hold the characters of the current column.
        let   temp =   [ ]
        // Populate the 'temp' array with characters from the current column across all rows.
        for (  let   j = 0  ;   j < tiles.length   ;   j++  ) {

            temp.push(  tiles[j][i]  )  ;
        }

        // Check if the current column (represented by 'temp') does not contain any '#' character.
        if (  temp.indexOf("#")   ===   -1  ) {

            // If no '#' is found in the column, remove this column from all rows.
            // Iterate through the rows in reverse order (though not strictly necessary here, it's a common pattern).
            for (  let   j = tiles.length - 1  ;   j >= 0   ;   j--  ) {

                // Convert the row string to an array of characters, filter out the character at the current column index 'i',
                // and then join it back into a string.
                tiles[j]   =   tiles[j].split("") . filter(  (val,idx)   =>   idx   !==   i  ) . join("")  ;
            }
        }
    }


    // Check for a special case: if only one row remains after all processing.
    if  (  tiles.length   ==   1   )   {

        // If only one row, filter out non-'#' characters and print the remaining '#' characters.
        console.log(  tiles[0].split("") . filter(  n   =>   n == "#"  ) . join("")  )  ;
        return  ; // Exit the function after printing.
    }

    // For all other cases, join the remaining tile rows with newline characters and print the result.
    console.log(  tiles.join("\n")  )  ;
}

// Read input from stdin, decode it as UTF-8, and pass it to the main function.
main(  require('fs').readFileSync(  '/dev/stdin',   'utf8'  )  )  ;