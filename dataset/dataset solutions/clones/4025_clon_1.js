/*
 * This JavaScript file processes card game scores.
 * It simulates a game where Alice and Bob take turns picking cards
 * from a sorted deck, and then calculates the difference in their total scores.
 */

// The 'Main' function serves as the entry point for processing the input data.
function   Main   (   input   )
{
	// The entire input is provided as a single string.
	// We split it by newline characters to get an array of individual lines.
	var input = input . split ( "\n" ) ;
    
    // The first line of input typically contains metadata, such as the number of cards.
    // In this specific problem, 'length' (input[0]) is read but not directly used for loop bounds,
    // as card.length is used later.
    var length = input [ 0 ] ;
    
	// The second line contains the card values, which are space-separated.
	var card = input [ 1 ] . split ( " " ) ;
	
	// Initialize arrays to store the cards picked by Alice and Bob.
	var alice = [ ] ;
	var bob = [ ] ;
	
	
	// Define a custom comparison function for sorting the cards.
	// Note: JavaScript's `sort()` with a custom comparison function expects
	// a negative number if 'a' should come before 'b', a positive number if 'a'
	// should come after 'b', and zero if they are considered equal.
	// The expression `a < b` evaluates to `true` (which coerces to 1) or `false` (which coerces to 0).
	// This particular implementation results in an ascending numerical sort for strings that convert to numbers.
	function compareFunc ( a , b )
	{
      return a < b ; // Returns 1 if a<b, 0 otherwise. This effectively sorts in ascending order.
    }
	
	// Sort the 'card' array using the custom comparison function.
	// This will arrange the card values in ascending order.
	card . sort ( compareFunc ) ;
	
	
	// Iterate through the sorted cards, distributing them alternately between Alice and Bob.
	for ( var i = 0 ; i < card . length ; i ++ )
	{
      // If the current index 'i' is even, Alice takes the card.
      if ( i % 2 == 0 )
      {
         alice . push ( card [ i ] ) ;
      }
      // If the current index 'i' is odd, Bob takes the card.
      else
      {
         bob . push ( card [ i ] ) ;
      } 
    }

	// Calculate Alice's total score.
	// First, map each card string in Alice's hand to an integer using parseInt.
	// Then, reduce the array of integers to a single sum.
  	aliceSum = alice . map ( str => parseInt ( str , 10 ) ) . reduce ( ( a , x ) => a += x ) ;
	
	// Calculate Bob's total score using the same process.
    bobSum = bob . map ( str => parseInt ( str , 10 ) ) . reduce ( ( a , x ) => a += x ) ;
	
	// Finally, print the difference between Alice's total score and Bob's total score to the console.
  	console . log ( aliceSum - bobSum ) ;
}

// This line reads the input from standard input (typically a file named /dev/stdin)
// and passes it as a string to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;