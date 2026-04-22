/* This script processes input data from standard input to solve a specific problem.
 * It involves array manipulation and a simulation loop.
 */

// Import the 'fs' module to handle file system operations, specifically reading input.
var   input   =   require('fs').readFileSync('/dev/stdin',   'utf8');


// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var   Arr   =   (input.trim()).split("\n");


// Main processing loop: continues indefinitely until a specific condition is met.
while   (true)
{

   // Extract the next line from the input array.
   var   np   =   Arr.shift();


   // Check for the termination condition: "0 0" indicates end of input.
   if   (np   ==   "0 0")
   {
      break; // Exit the while loop.
   }


   // Parse the current line: split by space and convert parts to numbers.
   np   =   np.split(" ").map(Number);


   // Assign the first number to 'n'. This typically represents the number of participants.
   var   n   =   np[0];


   // Assign the second number to 'p'. This 'p' represents the initial number of items.
   var   p   =   np[1];


   // Store the initial value of 'p' in 'sum' for comparison later.
   var   sum   =   p;


   // Initialize an empty array 'arr' which will hold counts for each participant.
   var   arr   =   [];


   // Populate 'arr' with 'n' zeros, representing initial state for 'n' participants.
   for   (var   i   =   0;   i   <   n;   i++)
   {
      arr.push(0); // Add a zero for each participant, indicating they start with no items.
   }


   // Initialize index 'j' for circular traversal of the 'arr' array.
   var   j   =   0;


   /*
    * This is the core simulation loop.
    * It runs for a maximum of 1,000,000 iterations to prevent infinite loops
    * in case a solution isn't found quickly.
    */
   for   (var   i   =   0;   i   <   1000000;   i++)
   {

      // If 'j' reaches the end of the array, reset it to 0 for circular behavior.
      if   (j   ==   arr.length)
      {
         j   =   0;
      }


      // Check if 'p' (current items in hand) is greater than zero.
      if   (p   >   0)
      {
         p--;         // Decrease 'p' by one (give one item to the current participant).
         arr[j]++;    // Increase the item count for the current participant 'j'.

         // Check if 'p' has become zero and the current participant 'j' has collected all 'sum' items.
         if   (p   ==   0   &&   sum   ==   arr[j])
         {
            console.log(j); // Output the index of the participant who collected all items.
            break;          // Exit the simulation loop as the problem condition is met.
         }
      }
      else   // If 'p' is zero, meaning the current player has no items to distribute.
      {
         p   =   arr[j];   // Take all items from participant 'j' and put them into 'p'.
         arr[j]   =   0;   // Reset participant 'j's item count to zero.
      }


      j++;   // Move to the next participant in the circle for the next iteration.
   }
}