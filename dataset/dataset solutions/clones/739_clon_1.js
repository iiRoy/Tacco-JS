/*
  This is a JavaScript program designed to solve a specific problem,
  likely a variation of the classic Josephus problem.
  It reads input from standard input, processes it in chunks,
  and outputs results to standard output.
*/


var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ; // First, we read all input from the standard input stream.
                                                                           // The 'fs' module is used for file system operations,
                                                                           // and readFileSync is a synchronous method to read the file.
                                                                           // '/dev/stdin' is a common Unix-like path for standard input.
                                                                           // 'utf8' specifies the character encoding.


var   arr   =   input . trim ( ) . split ( "\n" ) ; // The raw input string is then processed:
                                                //   1. '.trim()' removes any leading or trailing whitespace.
                                                //   2. '.split("\n")' divides the string into an array of substrings,
                                                //      using the newline character as a delimiter.
                                                //      Each element of 'arr' will be a line from the input.


// The primary logic of the program resides within this 'while(true)' loop.
// It continuously processes sets of parameters until a specific termination condition is met.
while   (   true   )
{

   // In each iteration, we extract three numbers (n, k, m) from the first line of 'arr'.
   //   - 'arr.shift()' removes the first element (line) from 'arr' and returns it.
   //   - '.split(" ")' splits this line into an array of strings based on spaces.
   //   - '.map(Number)' converts each string in that array to a numerical type.
   //   - Array destructuring '[n,k,m]' assigns these numbers to respective variables.
   var   [ n , k , m ]   =   arr . shift ( ) . split ( " " ) . map ( Number ) ;


   // This is the termination condition for the main loop.
   // If the sum of n, k, and m is zero, it indicates the end of input or a stop signal.
   if   ( n + k + m == 0 )
   {
      break ; // Exit the 'while(true)' loop.
   }


   // Initialize an array 'a'. This array will serve as a boolean flag array,
   // where 'a[i] = true' means participant 'i' is still in the game, and 'false' means eliminated.
   var   a   =   [ ] ;

   // Populate the 'a' array. Initially, all 'n' participants are considered active (true).
   for   ( var   i   =   0 ;   i   <   n ;   i ++ )
   {
      a [ i ]   =   true ; // Mark participant 'i' (0-indexed) as present.
   }


   var   z   =   m - 1 ; // 'z' represents the current starting position for counting.
                        // It's initialized based on 'm' (1-indexed in problem, so m-1 for 0-indexed array).

   var   sum   =   n ; // 'sum' keeps track of the total number of participants currently active.
                       // Initially, all 'n' participants are active.


   // This nested 'while(true)' loop simulates the rounds of elimination.
   // It continues until only one participant remains.
   while   (   true   )
   {
      // If 'sum' becomes 1, it means only one participant is left, so the elimination process for this set is complete.
      if   ( sum   ==   1 )
      {
         break ; // Exit this inner elimination loop.
      }


      a [ z ]   =   false ; // The participant at the current position 'z' is eliminated (marked as false).
      sum -- ; // Decrement the count of active participants.


      var   cnt   =   0 ; // 'cnt' is a counter used to track 'k' steps for finding the next participant to eliminate.


      // This innermost 'while(true)' loop is responsible for finding the 'k-th' active participant
      // from the current position 'z' (after the previous elimination).
      while   (   true   )
      {
         // Once 'k' active participants have been counted, we've found the next target.
         if   ( cnt   ==   k )
         {
            break ; // Exit this innermost counting loop.
         }


         z ++ ; // Move to the next position in the circular array.

         // Handle array wrapping: if 'z' goes beyond the array bounds,
         // it wraps around to the beginning (index 0).
         if   ( z   >=   n )
         {
            z   =   0 ;
         }


         // If the participant at the current 'z' position is active (a[z] is true),
         // then we increment our 'k' step counter.
         if   ( a [ z ] )
         {
            cnt ++ ;
         }
      }
   }


   // After the elimination process is complete for a given (n, k, m) set,
   // we iterate through the 'a' array to find the single remaining participant.
   a . forEach ( ( v , i )   =>   {
      // 'v' is the boolean value (true/false) for the participant, 'i' is the index.
      if   ( v ) // If 'v' is true, this participant survived.
      {
         console . log ( i + 1 ) ; // Print the 1-based index of the surviving participant.
      }
   } ) ;


} // End of the main processing while loop.