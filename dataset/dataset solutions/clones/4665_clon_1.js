/*
 * This JavaScript file contains the implementation for the Main function,
 * which processes a given input to find a specific numerical property.
 *
 * Author:   Clone Generator
 * Date:     2023-10-27
 * Version:  1.0
 */

// Define the main function that takes an input string.
function          Main          (          input          )          {

    // Parse the input string into an integer.
    input = parseInt ( input ) ;

    // Calculate the initial length of the input number as a string.
    // This value 'f' will be updated later.
    var       f       =       (          input          +          ""          )          .          length          ;

    // Loop from i = 0 up to, but not including, the square root of the input.
    // This loop searches for factors and minimizes 'f'.
    for          (          i          =          0          ;          i          <          Math          .          sqrt          (          input          )          ;          i          ++          )          {

        // Calculate 'm', the maximum length of the string representation
        // of 'i' and 'input/i'.
        m          =          Math          .          max          (          (          i          +          ""          )          .          length          ,          (          input          /          i          +          ""          )          .          length          )          ;

        // Check if 'i' is a divisor of 'input' AND if 'm' is less than the
        // current minimum length 'f'.
        if          (          input          %          i          ==          0          &&          m          <          f          )          {

            // If both conditions are met, update 'f' with the new minimum length 'm'.
            f          =          m          ;
        }
    }

    // Output the final calculated value 'f' to the console.
    console          .          log          (          '%s'          ,          f          )          ;
}


// Call the Main function with input read from standard input.
// The input is read as a UTF-8 string.
Main          (          require          (          "fs"          )          .          readFileSync          (          "/dev/stdin"          ,          "utf8"          )          )          ;