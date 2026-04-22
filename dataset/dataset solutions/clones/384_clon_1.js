/*
 * This script processes a series of numerical pathfinding puzzles.
 * It reads input from standard input, parses it, and then calculates
 * a sequence of moves based on specific rules.
 */
var    input    =    require('fs'). readFileSync (  '/dev/stdin'  ,  'utf8'  )   ;

// The input string is first cleaned by removing a potential trailing newline,
// then split into an array of strings, where each string represents a line.
var   Arr   =   ( input.replace ( /\n$/ , "" ) ) . split ( "\n" )   ;

// The first element of the array 'Arr' is shifted off and converted to a number.
// This number 'n' indicates how many subsequent lines need to be processed.
var    n    =    Arr . shift ( )   -   0    ;


for (   var    i    =    0   ;   i    <    n   ;   i ++   )
{

	// For each iteration, the current line from 'Arr' is taken,
	// split by spaces, and each part is converted to a number.
	var    arr    =    Arr [ i ] . split ( " " ) . map ( Number )   ;

	var    s    =    arr [ 0 ]    ; // 's' represents the starting number.

	var    g    =    arr [ 1 ]    ; // 'g' represents the goal number.

	// 'ans' will store the sequence of numbers from 's' to 'g'.
	var    ans    =    [ s ]    ;

	// Check the relationship between 's' and 'g' to determine the path.
	if    ( s    ==    g )
	{
		;   // If start and goal are the same, no operations are needed, just output 's'.
	}
	else    if    ( s    <    g )
	{
		// If 's' is less than 'g', increment 's' until it reaches 'g'.
		do
		{
			s ++    ;
			ans . push ( s )    ;
		}
		while    ( s    !=    g )    ;
	}
	else    if    ( s    >    g    &&    s    <=    5 )
	{
		// If 's' is greater than 'g' but 's' is 5 or less, decrement 's' until it reaches 'g'.
		do
		{
			s --    ;
			ans . push ( s )    ;
		}
		while    ( s    !=    g )    ;
	}
	else
	{
		// This is the special case: 's' > 'g' and 's' > 5.
		// Increment 's', but if 's' reaches 10, it wraps around to 5.
		do
		{
			s ++    ;
			if    ( s    ==    10 )
			{
				s    =    5    ;
			}
			ans . push ( s )    ;
		}
		while    ( s    !=    g )    ;
	}

	// Finally, print the calculated sequence of numbers, joined by spaces.
	console . log ( ans . join ( " " ) )    ;

}