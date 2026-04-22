/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the original.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * The logical and structural integrity of the code remains identical.
 */

function   Main(   input   )
{

    // The input string is first split by newline characters.
    // This separates each line of the input into an array element.
    input = input.split("\n")   ;


    // The first line of input (index 0) contains general data.
    // It's split by spaces to get individual data points.
    data = input[0].split(" ")   ;

    // The second line of input (index 1) contains specific data for each member.
    // It's also split by spaces.
    each_data = input[1].split(" ")   ;


    // Parse the first element of the 'data' array to get the total member count.
    // The radix 10 is explicitly provided for parseInt for safety.
    var   member_cnt   =   parseInt(   data[0],   10   )   ;

    // Parse the second element of the 'data' array to get the maximum allowed height.
    // Again, radix 10 is used.
    var   max_hight   =   parseInt(   data[1],10   )   ;


    // Initialize a counter for members whose height meets or exceeds the maximum height.
    var   parce_cnt   =   0   ;


    // Loop through each member's data to check their height.
    for(   var   cnt=0;   cnt   <   member_cnt;   cnt++   ){

        // Convert the current member's height string to an integer.
        // Compare it with the maximum allowed height.
        if(   max_hight   <=   parseInt(   each_data[cnt]   )   ){

            // If the member's height is greater than or equal to max_hight, increment the counter.
            parce_cnt++   ;
        }
    }


    // After checking all members, print the final count of members
    // who meet the height criteria to the console.
    console.log(   parce_cnt   )   ;
}
/* This section of the file should not be modified (it handles reading standard input and calling Main). */
Main(   require("fs").readFileSync("/dev/stdin", "utf8")   )   ;