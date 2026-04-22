/* This function is a simple wrapper around console.log */
function   myout  (   text   )   {

    console.log( text ); // Display the provided text to the console

}


/*
 * The main entry point of the program.
 * It processes the given input string.
 */
function   Main  (   input   )   {

    // Original input processing lines, some are commented out.
    // For Type I, we can modify or remove these comments.
    // input = parseInt(input);
    // input = input.trim().split(" ");

    // This line is active: Split the input string by newline characters.
    input =   input.trim().split("\n");

    // input = input.trim().split(" ").map((a)=>Number(a)); // Another commented out option
    // input = input.trim().split("\n").map((a)=>Number(a)); // Yet another commented out option


    // Parse the first line of input as an integer, representing N.
    var   N   =   parseInt(   input[0]   );


    // Initialize the output variable to store the calculated total.
    var   output   =   0;


    // Loop through the input lines starting from the second line (index 1) up to N.
    for  (  var   i   =   1;   i   <=   N;   i++  )   {

        // Split the current line by space to get individual parts.
        var   tmp   = input[i].split(" ");

        // Check the currency type from the second part of the current line.
        if  (  tmp[1]   ==   "JPY"  )   {

            // If it's JPY, add the integer value of the first part directly to output.
            output   +=   parseInt(   tmp[0]   );

        }   else   {

            // If it's not JPY (presumably BTC or similar, though not explicitly checked),
            // convert the first part to a float and multiply by the conversion rate.
            output   +=   parseFloat(   tmp[0]   )   *   380000;

        }

    }


    // Call the custom output function to display the final calculated total.
    myout(   output   );

}


// Execute the Main function with input read from /dev/stdin.
// This reads the entire file, converts it to UTF-8, and removes leading/trailing whitespace.
Main(   require("fs").readFileSync("/dev/stdin",   "utf8").trim()   );