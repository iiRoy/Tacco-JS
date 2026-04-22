/*
 * This script processes standard input using Node.js readline module.
 * It calculates a specific count based on an input value X.
 */

process.stdin.resume(); // Ensure standard input stream remains open.

process.stdin.setEncoding('utf8'); // Set encoding for input data.

// Declare an array to store all incoming lines from standard input.
var   lines = [  ];

// Initialize the readline interface for input/output operations.
var   reader  =  require('readline')  .  createInterface(  {
    input  :   process.stdin  ,
    output :   process.stdout
}  )  ;

// Event listener for each line received from standard input.
reader.on('line'  ,  (line)  =>  {
    lines.push(line); // Add the received line to the 'lines' array.
}  )  ;

// Event listener for when the input stream closes.
reader.on('close'  ,  (  )  =>  {
    // Parse the first line of input as an integer, base 10.
    var  X  =  parseInt(  lines[0]  ,  10  )  ;


    // Initialize a counter variable.
    var  count  =  0  ;

    /*
     * Define a function 'sum' that takes an integer L.
     * This function iterates through i, j, k from 1 to 100
     * and increments 'count' if the specific polynomial
     * i*i + k*k + j*j + i*k + j*i + k*j equals L.
     */
    function  sum(  L  )  {
        for  (  var  i  =  1  ;  i  <=  100  ;  i++  )  {
            for  (  var  j  =  1  ;  j  <=  100  ;  j++  )  {
                for  (  var  k  =  1  ;  k  <=  100  ;  k++  )  {
                    // Check the condition for incrementing the counter.
                    if  (  i*i  +  k*k  +  j*j  +  i*k  +  j*i  +  k*j  ===  L  )  {

                        count++; // Increment the global counter.
                    }
                } // End of inner-most loop (k).
            } // End of middle loop (j).
        } // End of outer-most loop (i).
    } // End of 'sum' function definition.


    // Loop from 1 up to the value of X.
    for  (  var  a  =  1  ;  a  <=  X  ;  a++  )  {
        sum(a); // Call the 'sum' function with the current loop variable 'a'.
        console.log(count); // Print the current value of 'count'.
        count = 0; // Reset 'count' for the next iteration.
    } // End of loop for 'a'.


}  )  ; // End of 'close' event handler.