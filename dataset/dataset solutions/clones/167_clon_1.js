/*
 * This JavaScript program is designed to solve a 24-game-like puzzle
 * where the goal is to use four given numbers and three arithmetic operators
 * (+, -, *) to form an expression that evaluates to exactly 10.
 * It considers all permutations of the input numbers and various
 * parenthesizations of the operators.
 *
 * Input is read from standard input, with each line containing four space-separated numbers.
 * The program terminates upon reading the line "0 0 0 0".
 * For each valid input line, it outputs an expression that equals 10,
 * or "0" if no such expression is found.
 */


// perm: An array to store all permutations of the indices [0, 1, 2, 3].
// Each element will be an array representing a unique order of the four input numbers.
var perm = [ ] ;


// flag: A boolean array used during the permutation generation process.
// It tracks which indices (0-3) have already been used in the current permutation path.
var flag = [ ] ;


// Initialize all elements of the flag array to false, indicating no indices are used yet.
for ( var i = 0 ; i < 4 ; i ++ )
{
  flag [ i ] = false ;
}


// cnt: A counter to keep track of the number of permutations found and
// to correctly index them into the 'perm' array.
var cnt = 0 ;


// --- Start of nested loops for permutation generation ---
// These four nested loops systematically generate all 4! (24) permutations
// of the indices 0, 1, 2, 3. This is a classic backtracking approach.

for ( var i = 0 ; i < 4 ; i ++ )
{
  flag [ i ] = true ; // Mark the first chosen index 'i' as used.

  for ( var ii = 0 ; ii < 4 ; ii ++ )
  {
    // Skip if the second index 'ii' has already been used in this permutation.
    if ( flag [ ii ] )
    {
      continue ;
    }
    flag [ ii ] = true ; // Mark 'ii' as used.

    for ( var iii = 0 ; iii < 4 ; iii ++ )
    {
      // Skip if the third index 'iii' has already been used.
      if ( flag [ iii ] )
      {
        continue ;
      }
      flag [ iii ] = true ; // Mark 'iii' as used.

      for ( var iiii = 0 ; iiii < 4 ; iiii ++ )
      {
        // Skip if the fourth index 'iiii' has already been used.
        if ( flag [ iiii ] )
        {
          continue ;
        }

        // If we reach this point, we have found a unique permutation of four indices.
        // Store this permutation in the 'perm' array.
        perm [ cnt ] = [ i , ii , iii , iiii ] ;
        cnt ++ ; // Increment the permutation counter.
      }
      flag [ iii ] = false ; // Backtrack: Unmark 'iii' so it can be used in other permutations.
    }
    flag [ ii ] = false ; // Backtrack: Unmark 'ii'.
  }
  flag [ i ] = false ; // Backtrack: Unmark 'i'.
}
// --- End of permutation generation ---


// Read the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Process the input string:
// 1. Remove leading/trailing whitespace using `trim()`.
// 2. Split the string into an array of lines based on the newline character (`"\n"`).
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// --- Main processing loop ---
// This loop continues indefinitely until a specific termination condition is met.
while ( true )
{

  // Extract the first line from the `Arr` array and remove it from the array.
  var abcd = Arr . shift ( ) ;

  // Check for the termination condition: if the line is "0 0 0 0".
  if ( abcd == "0 0 0 0" )
  {
    break ; // Exit the `while` loop.
  }


  // Parse the four numbers from the current line.
  // 1. Split the string by spaces.
  // 2. Use `map(Number)` to convert each string segment into a numerical value.
  var ary = abcd . split ( " " ) . map ( Number ) ;


  // ans: Stores the resulting expression (as a string) that evaluates to 10.
  // Initialized to 0, indicating no solution found yet for the current input line.
  var ans = 0 ;


  // s: An array containing the three basic arithmetic operators.
  var s = [ "+" , "-" , "*" ] ;


  // --- Nested loops for trying all operator combinations ---
  // These loops iterate through all 3^3 = 27 possible combinations of operators.
  for ( var i = 0 ; i < 3 ; i ++ )
  {
    for ( var j = 0 ; j < 3 ; j ++ )
    {
      for ( var k = 0 ; k < 3 ; k ++ )
      {

        // For each operator combination, iterate through all generated number permutations.
        perm . forEach ( function ( v )
        {

          // Extract the four numbers from the input array (`ary`)
          // according to the current permutation `v`.
          var a = ary [ v [ 0 ] ] ;
          var b = ary [ v [ 1 ] ] ;
          var c = ary [ v [ 2 ] ] ;
          var d = ary [ v [ 3 ] ] ;


          // Attempt to evaluate expressions with different parenthesizations.
          // The `if (ans == 0)` condition ensures that once a solution is found,
          // it is not overwritten by subsequent solutions (prioritizing the first one found).

          // Parenthesization 1: No explicit parentheses (left-to-right evaluation)
          // e.g., a + b - c * d
          if ( ans == 0 && eval ( a + s [ i ] + b + s [ j ] + c + s [ k ] + d ) == 10 )
          {
            ans = a + s [ i ] + b + s [ j ] + c + s [ k ] + d ;
          }

          // Parenthesization 2: (a op1 b op2 c) op3 d
          // e.g., (a + b - c) * d
          if ( ans == 0 && eval ( "(" + a + s [ i ] + b + s [ j ] + c + ")" + s [ k ] + d ) == 10 )
          {
            ans = "(" + a + s [ i ] + b + s [ j ] + c + ")" + s [ k ] + d ;
          }

          // Parenthesization 3: (a op1 b) op2 (c op3 d)
          // e.g., (a + b) * (c - d)
          if ( ans == 0 && eval ( "(" + a + s [ i ] + b + ")" + s [ j ] + "(" + c + s [ k ] + d + ")" ) == 10 )
          {
            ans = "(" + a + s [ i ] + b + ")" + s [ j ] + "(" + c + s [ k ] + d + ")" ;
          }

          // Parenthesization 4: ((a op1 b) op2 c) op3 d
          // e.g., ((a + b) - c) * d
          if ( ans == 0 && eval ( "(" + "(" + a + s [ i ] + b + ")" + s [ j ] + c + ")" + s [ k ] + d ) == 10 )
          {
            ans = "(" + "(" + a + s [ i ] + b + ")" + s [ j ] + c + ")" + s [ k ] + d ;
          }

        } ) ; // End of perm.forEach
      }
    }
  }
  // --- End of operator and permutation evaluation ---


  // If an expression was found (`ans` is not 0), enclose it in an outer set of parentheses
  // for consistent output formatting.
  if ( ans != 0 )
  {
    ans = "(" + ans + ")" ;
  }


  // Print the found expression (or "0" if no expression was found) to the console.
  console . log ( ans ) ;

} // End of main while loop