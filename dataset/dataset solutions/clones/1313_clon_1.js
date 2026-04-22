/*
 * This JavaScript code reads input from standard input,
 * counts the occurrences of each letter (case-insensitive),
 * and then prints the counts in alphabetical order.
 *
 * It is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */


const input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire input as a UTF-8 string

// Convert the input string into an array of characters.
// This allows easy iteration over individual characters.
const arr = [ ... input ] ;


// Initialize an empty string to accumulate the output.
let   str = '' ;

/*
 * Initialize an object to store the counts of each letter.
 * All letter counts are set to 0 initially.
 * This object will be used as a frequency map.
 */
let obj =
{
  a : 0 , // Counter for 'a'
  b : 0 , // Counter for 'b'
  c : 0 , // Counter for 'c'
  d : 0 , // Counter for 'd'
  e : 0 , // Counter for 'e'
  f : 0 , // Counter for 'f'
  g : 0 , // Counter for 'g'
  h : 0 , // Counter for 'h'
  i : 0 , // Counter for 'i'
  j : 0 , // Counter for 'j'
  k : 0 , // Counter for 'k'
  l : 0 , // Counter for 'l'
  m : 0 , // Counter for 'm'
  n : 0 , // Counter for 'n'
  o : 0 , // Counter for 'o'
  p : 0 , // Counter for 'p'
  q : 0 , // Counter for 'q'
  r : 0 , // Counter for 'r'
  s : 0 , // Counter for 's'
  t : 0 , // Counter for 't'
  u : 0 , // Counter for 'u'
  v : 0 , // Counter for 'v'
  w : 0 , // Counter for 'w'
  x : 0 , // Counter for 'x'
  y : 0 , // Counter for 'y'
  z : 0   // Counter for 'z'
} ;

// Loop through each character in the input array.
for ( let i = 0 ; i < arr . length ; i ++ )
{
  /*
   * Check if the current character is NOT an English alphabet letter (A-Z or a-z).
   * If it's not a letter, skip to the next iteration.
   */
  if ( ( / [^A-Z,a-z] / ) . test ( arr [ i ] ) )
  {
    continue ; // Move to the next character without processing this one.
  }

  // Increment the counter for 'a' or 'A' if found.
  if ( / [Aa] / . test ( arr [ i ] ) ) obj . a ++ ;

  // Increment the counter for 'b' or 'B'.
  if ( / [Bb] / . test ( arr [ i ] ) ) obj . b ++ ;

  // Increment the counter for 'c' or 'C'.
  if ( / [Cc] / . test ( arr [ i ] ) ) obj . c ++ ;

  // Increment the counter for 'd' or 'D'.
  if ( / [Dd] / . test ( arr [ i ] ) ) obj . d ++ ;

  // Increment the counter for 'e' or 'E'.
  if ( / [Ee] / . test ( arr [ i ] ) ) obj . e ++ ;

  // Increment the counter for 'f' or 'F'.
  if ( / [Ff] / . test ( arr [ i ] ) ) obj . f ++ ;

  // Increment the counter for 'g' or 'G'.
  if ( / [Gg] / . test ( arr [ i ] ) ) obj . g ++ ;

  // Increment the counter for 'h' or 'H'.
  if ( / [Hh] / . test ( arr [ i ] ) ) obj . h ++ ;

  // Increment the counter for 'i' or 'I'.
  if ( / [Ii] / . test ( arr [ i ] ) ) obj . i ++ ;

  // Increment the counter for 'j' or 'J'.
  if ( / [Jj] / . test ( arr [ i ] ) ) obj . j ++ ;

  // Increment the counter for 'k' or 'K'.
  if ( / [Kk] / . test ( arr [ i ] ) ) obj . k ++ ;

  // Increment the counter for 'l' or 'L'.
  if ( / [Ll] / . test ( arr [ i ] ) ) obj . l ++ ;

  // Increment the counter for 'm' or 'M'.
  if ( / [Mm] / . test ( arr [ i ] ) ) obj . m ++ ;

  // Increment the counter for 'n' or 'N'.
  if ( / [Nn] / . test ( arr [ i ] ) ) obj . n ++ ;

  // Increment the counter for 'o' or 'O'.
  if ( / [Oo] / . test ( arr [ i ] ) ) obj . o ++ ;

  // Increment the counter for 'p' or 'P'.
  if ( / [Pp] / . test ( arr [ i ] ) ) obj . p ++ ;

  // Increment the counter for 'q' or 'Q'.
  if ( / [Qq] / . test ( arr [ i ] ) ) obj . q ++ ;

  // Increment the counter for 'r' or 'R'.
  if ( / [Rr] / . test ( arr [ i ] ) ) obj . r ++ ;

  // Increment the counter for 's' or 'S'.
  if ( / [Ss] / . test ( arr [ i ] ) ) obj . s ++ ;

  // Increment the counter for 't' or 'T'.
  if ( / [Tt] / . test ( arr [ i ] ) ) obj . t ++ ;

  // Increment the counter for 'u' or 'U'.
  if ( / [Uu] / . test ( arr [ i ] ) ) obj . u ++ ;

  // Increment the counter for 'v' or 'V'.
  if ( / [Vv] / . test ( arr [ i ] ) ) obj . v ++ ;

  // Increment the counter for 'w' or 'W'.
  if ( / [Ww] / . test ( arr [ i ] ) ) obj . w ++ ;

  // Increment the counter for 'x' or 'X'.
  if ( / [Xx] / . test ( arr [ i ] ) ) obj . x ++ ;

  // Increment the counter for 'y' or 'Y'.
  if ( / [Yy] / . test ( arr [ i ] ) ) obj . y ++ ;

  // Increment the counter for 'z' or 'Z'.
  if ( / [Zz] / . test ( arr [ i ] ) ) obj . z ++ ;
}


/*
 * Iterate over the keys (letter names) of the 'obj' object.
 * For each key, append the letter and its count to the 'str' variable.
 * The format will be "key : value\n".
 */
Object . keys ( obj ) . forEach ( key =>
{
  str += key + ' : ' + obj [ key ] + '\n' ;
} ) ;

// Print the final string to the console, removing any trailing whitespace (like the last newline).
console . log ( str . trim ( ) ) ;

// End of program.