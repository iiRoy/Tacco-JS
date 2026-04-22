/* This JavaScript file processes input data
   to calculate minimum values based on specific
   conditions and mathematical operations.
   It reads from standard input, parses numbers,
   and performs complex calculations within nested
   anonymous functions. */

var input = require('fs') .readFileSync( '/dev/stdin' , 'utf8' );

// Split the input into an array of lines
var arr= input .trim() .split( "\n" );


// Main processing loop: continues until a specific termination condition is met
while(true)
{

   // Get the first line segment for current iteration
   var abc=arr.shift();

   // Check for the termination condition: "0 0 0 0 0"
   if(abc=="0 0 0 0 0")
   {
      break; // Exit the loop if the condition is met
   }

   // Concatenate the current line segment with the next one from the array,
   // then split by space and convert all parts to numbers.
   var ary=(abc+" "+arr.shift()).split(" ").map(Number);

   // This is an immediately invoked function expression (IIFE)
   // It applies the 'ary' array as arguments to the function.
   (function(a,b,c,d,e,na,nb,nc){

      // Calculate initial 'ans' based on 'nc', 'd', and 'e'.
      var ans= Math.floor(nc/d)*d*e;


      // Calculate the remainder of 'nc' divided by 'd'.
      var nokori=nc%d;


      // Inner IIFE 'A' to calculate one possible total.
      var A=(function(ans){

         ans+=nokori*c; // Add cost for remaining items.

         ans+=na*a+nb*b; // Add cost for 'na' and 'nb' items.

         return ans; // Return the calculated total for A.

      })(ans);


      // Inner IIFE 'B' to calculate another possible total, with more complex logic.
      var B=(function(ans,na,nb){

         // If the initial 'ans' was zero, special handling is required.
         if(ans==0){

            // Determine if there's a 'yobun' (excess) amount from the remainder.
            var yobun= (nokori==0) ? 0 : d-nokori;

            // If there's an excess, add a base cost.
            if(yobun>0)
            {
               ans+=e*d;
            }

            // Loop to reduce 'yobun' and consume 'nb' then 'na'.
            while(yobun--)
            {
               if(nb>0)
               {
                  nb--;
               }
               else if(na>0)
               {
                  na--;
               }
            }

            // Add remaining costs for 'na' and 'nb' items.
            ans+=na*a+nb*b;

            return ans; // Return the calculated total for B in this case.
         }

         // If initial 'ans' was not zero, use a simpler calculation for B.
         if(ans!=0){

            return na*a+nb*b+nc*e; // Return direct sum of costs.

         }

      })(ans,na,nb); // Pass 'ans', 'na', 'nb' to IIFE B.


      // Output the minimum of the two calculated totals (A and B).
      console.log(Math.min(A,B));

   }).apply(null,ary); // Apply the 'ary' values as arguments to the main IIFE.

} // End of the while loop.