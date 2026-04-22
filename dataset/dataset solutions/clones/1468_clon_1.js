/*
 *  This JavaScript program is designed to read game data
 *  from standard input, process a series of card game rounds
 *  between two players, Taro and Hanako, and then
 *  output their final accumulated scores.
 *
 *  The input format is expected to be:
 *  - The first line contains an integer 'n', representing the number of rounds.
 *  - Each subsequent 'n' lines contains two strings (card values)
 *    separated by a space, representing the cards played by Taro and Hanako
 *    in that respective round.
 *
 *  Scoring rules:
 *  - If Taro's card is lexicographically greater than Hanako's, Taro gets 3 points.
 *  - If Hanako's card is lexicographically greater than Taro's, Hanako gets 3 points.
 *  - If the cards are equal, both players get 1 point.
 */

//  We begin by importing the 'fs' (file system) module, which is a core Node.js module.
//  This allows us to interact with the file system, including reading from standard input.
var   input  =  require ( 'fs' ) . readFileSync (  '/dev/stdin'  ,   'utf8'  ) ;


//  The raw input string, which includes all lines from stdin, is then split
//  into an array of individual lines using the newline character ('\n') as a delimiter.
var   lines   =   input . split ( '\n' ) ;


//  Initialize score variables for both players to zero.
//  These variables will accumulate points throughout the game rounds.
var     taroPoint    =    0    ;
var     hanakoPoint    =    0    ;


//  The very first line of the input array contains the total number of rounds to be played.
//  The `shift()` method removes this line from the `lines` array and returns it.
//  The unary plus operator `+` is used to explicitly convert the string representation of 'n' into a number.
var   n   =   + lines . shift ( ) ;


//  This `for` loop iterates 'n' times, once for each game round.
//  The loop variable `i` serves as a round counter.
for    (   var    i    =    0    ;    i    <    n    ;    i ++    )    {

  //  Inside each round, we again use `shift()` to get the next line from the `lines` array.
  //  This line contains the cards played by Taro and Hanako for the current round.
  //  We then split this line by a space (' ') to separate the two card values into an array called 'hands'.
  var    hands    =    lines . shift ( ) . split ( ' ' ) ;

  //  Taro's card is the first element in the 'hands' array (index 0).
  var    taroHand    =    hands [ 0 ] ;
  //  Hanako's card is the second element in the 'hands' array (index 1).
  var    hanakoHand    =    hands [ 1 ] ;


  //  Now, we apply the game's scoring logic based on the comparison of the two hands.
  //  String comparison (lexicographical order) is used here.
  if    (    taroHand    >    hanakoHand    )    {
    //  If Taro's hand is greater, Taro receives 3 points.
    taroPoint    +=    3    ;
  }
  else    if    (    taroHand    <    hanakoHand    )    {
    //  If Hanako's hand is greater, Hanako receives 3 points.
    hanakoPoint    +=    3    ;
  }
  else    {
    //  If both hands are equal, it's a draw. Both players receive 1 point.
    taroPoint ++ ;
    hanakoPoint ++ ;
  }

}


//  After all rounds have been processed and scores accumulated,
//  the final scores of Taro and Hanako are printed to the console.
//  They are separated by a single space as per typical output requirements.
console . log ( taroPoint + ' ' + hanakoPoint ) ;