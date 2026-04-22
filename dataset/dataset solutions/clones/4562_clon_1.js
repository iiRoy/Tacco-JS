/*
 * This JavaScript file contains a function to process grid-like input.
 * It's a Type I clone, which means its functionality is identical to the original,
 * with only modifications to whitespace and comments.
 */
function   Main   ( input   )    {

    // The input is initially a single string; we split it by newline characters
    // to get an array where each element represents a line from the input.
    input   =   input.split  (  "\n"  )   ;

    // The first line of input specifies the dimensions (width and height)
    // of the grid. We split this line by space to get these two values.
    var   wh   =   input[0] .  split   (   " "   )    ;


    // Parse the height value from the first element of the 'wh' array.
    var   h   =   parseInt   (   wh[0]   ,   10   )   ;

    // Parse the width value from the second element of the 'wh' array.
    var   w   =   parseInt   (   wh[1]   ,   10   )   ;


    // We iterate through rows to construct the output, including two extra rows
    // for the top and bottom borders.
    for   (   var   i   =   0   ;   i   <   h   +   2   ;   i ++   )    {

        // Initialize an array to hold the characters for the current row.
        // Every row starts with a '#' character, representing the left border.
        var   column   =   [   '#'   ]    ;

        // This inner loop processes the content or border characters for the current row.
        for   (   var   j   =   0   ;   j   <   w   ;   j ++   )    {

            // Check if the current row index 'i' corresponds to the top border (0)
            // or the bottom border (h + 1).
            if   (   i   ===   0   ||   i   ===   h   +   1   )    {

                // If it's a border row, add a '#' character.
                column.push   (   '#'   )    ;

            }   else   {

                // Otherwise, for content rows, retrieve the character from the
                // original input grid at the corresponding position.
                column.push   (   input[i][j]   )    ;
            }
        }

        // After the inner content/border characters are added, append a '#'
        // for the right border of the current row.
        column.push   (   '#'   )    ;

        // Join all characters in the 'column' array to form a complete string for the row
        // and then print this row to the console.
        console.log   (   column.join   (   ''   )   )    ;
    }
}


// ********************************************************************************
// * DO NOT MODIFY THE FOLLOWING CODE BLOCK. This handles standard I/O operations. *
// * It reads all data from standard input and passes it to the Main function.    *
// ********************************************************************************
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;