/*
 * This JavaScript snippet processes lines from standard input.
 * For each line, it expects two space-separated numbers,
 * then calculates and prints their Greatest Common Divisor (GCD)
 * and Least Common Multiple (LCM).
 *
 * This is a Type I clone: only whitespace and comments have been altered.
 */


require ( "fs" )
    . readFileSync ( "/dev/stdin" , "utf8" ) // Read the entire standard input as a UTF-8 string
    . trim ( ) // Remove any leading or trailing whitespace from the input
    . split ( '\n' ) // Split the input string into an array of lines based on newline characters
    . some ( // Iterate over each line; 'some' will process all lines as the callback doesn't return true
        function ( i ) { // 'i' represents the current line string
            // Parse the two numbers from the current line
            j = i . split ( ' ' ) ; // Split the line by space to get an array 'j' containing the two numbers as strings
            a = j [ 0 ] ; // Assign the first number string to variable 'a'
            b = j [ 1 ] ; // Assign the second number string to variable 'b'

            // Calculate the product of 'a' and 'b' for later LCM calculation
            c = a * b ; // 'c' will store a * b (implicitly converting string numbers to actual numbers)

            // Euclidean algorithm to find the Greatest Common Divisor (GCD) of 'a' and 'b'
            while ( m = a % b ) { // Loop continues as long as the remainder 'm' (a % b) is not zero
                a = b ; // Update 'a' to the current value of 'b'
                b = m ; // Update 'b' to the remainder 'm'
            }

            // Output the calculated GCD and LCM
            console . log ( b , c / b ) // 'b' now holds the GCD; 'c / b' calculates the LCM (product / GCD)
        }
    )
; // End of the method chain