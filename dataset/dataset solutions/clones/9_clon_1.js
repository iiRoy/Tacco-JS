/**********************************************************************************
 * This script processes input lines from standard input.                         *
 * Each line is expected to contain two space-separated numbers.                  *
 * For each line, it calculates the sum of these numbers and prints               *
 * the number of digits in the sum to the console.                                *
 **********************************************************************************/


// Initiate the standard input stream to prevent the process from exiting immediately.
process.stdin.resume();

// Set the character encoding for the standard input stream to 'utf8'.
process.stdin.setEncoding('utf8');


// Attach an event listener for 'data' events on the standard input stream.
// This function will be called whenever new data is available.
process.stdin.on('data', function  (  chunk  )   {

        // Convert the incoming data chunk to a string.
        var   aaa   =   chunk.toString();

        // Split the entire input string by newline characters to get individual lines.
        // Note: The last element might be an empty string if the input ends with a newline.
        var   line   =   aaa.split (  "\n"  )

        // Remove the last element from the 'line' array.
        // This is typically done to handle an empty string resulting from a trailing newline.
        line.pop  (  )  ;

        // Iterate over each processed line in the 'line' array.
        for  (  var   i   in   line  )  {

                // Split the current line by spaces to separate the two numbers.
                var   l   =   line[i].split (  " "  )

                // Convert the first part of the split line to a Number object.
                var   num1   =   new   Number   (  l[0]  )  ;

                // Convert the second part of the split line to a Number object.
                var   num2   =   new   Number (  l[1]  )  ;


                // Calculate the sum of the two numbers.
                var   num   =   num1  +  num2

                // The original code had a commented-out line here. It's preserved.
                // This line was likely for converting the number to a string, but not used.
                //num.toString();

                // Convert the sum to a string and then get its length (number of digits).
                // Finally, print this length to the console.
                console.log  (  String  (  num  )  .length  )  ;

        } // End of the 'for...in' loop.

}  )  ; // End of the 'data' event listener function.