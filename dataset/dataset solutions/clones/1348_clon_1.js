/*
 * This JavaScript program calculates the area and circumference of a circle.
 * It reads the radius value from standard input.
 *
 * Type I Clone - Extensive whitespace and comments added.
 */

// Declare a variable 'R' to store the radius.
// The '+' unary operator converts the string read from input into a number.
var   R   =   +  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,   "utf8"  )
; // End of input reading and radius assignment.


// Now, we will calculate the area and circumference and print them.
// The area is calculated as PI * R * R.
// The circumference is calculated as 2 * PI * R.
// Both values are formatted to 6 decimal places.

console
    . log
    (
        (   R   *   R   *   Math  .  PI   ) // Calculate the area of the circle.
            . toFixed (  6  )                  // Format area to 6 decimal places.

        +   ' '                                // Add a space separator between area and circumference.

        +   (   R   *   2   *   Math  .  PI   ) // Calculate the circumference of the circle.
            . toFixed (  6  )                  // Format circumference to 6 decimal places.
    )
; // End of console output statement.