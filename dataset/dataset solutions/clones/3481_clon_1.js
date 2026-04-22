// This file contains a JavaScript solution to a specific algorithmic problem.
// It includes a main function to process input and a utility function for calculating the Greatest Common Divisor (GCD).

function Main ( input )
{
	// The input string is first split into an array of lines.
	var a = input.split( "\n" ) ;

	// The first line of input (a[0]) is further split by spaces to get numerical parameters.
	var b = a[ 0 ].split( " " ) ;

	// Convert the string representations of numbers to actual numeric types.
	// The `* 1` idiom is a common way to achieve type conversion in JavaScript.
	var n = b[ 0 ] * 1 ; // Represents the first parameter, often a length or count.
	var m = b[ 1 ] * 1 ; // Represents the second parameter, also a length or count.


	// The second line of input contains string S.
	var S = a[ 1 ] ;

	// The third line of input contains string T.
	var T = a[ 2 ] ;

	// Calculate 'l', which represents the Least Common Multiple (LCM) of 'n' and 'm'.
	// The formula used is LCM(n, m) = (n * m) / GCD(n, m).
	var l = n * m / gcd( m , n ) ;


	// Initialize two empty strings, 'hoge' and 'fuga', which will be populated based on S and T.
	var hoge = "" ;
	var fuga = "" ;

	// A temporary variable 't' is initialized. Its purpose is not clear from this snippet
	// as it's not used in the final return or subsequent logic, but it's part of the original code.
	var t = "" + l + "\n\n" ;

	// This loop iterates through string S, appending characters to 'hoge' at specific intervals.
	// The interval is determined by 'l / m'.
	for ( var j = 0 ; j < n ; j += ( l / m ) )
	{
		hoge += S[ j ] ; // Append the character at index 'j' from S to hoge.
	}


	// This loop iterates through string T, appending characters to 'fuga' at specific intervals.
	// The interval is determined by 'l / n'.
	for ( var j = 0 ; j < m ; j += ( l / n ) )
	{
		fuga += T[ j ] ; // Append the character at index 'j' from T to fuga.
	}

	// Finally, compare the two constructed strings, 'hoge' and 'fuga'.
	// If they are strictly equal, return the calculated LCM ('l').
	// Otherwise, if they are not equal, return -1.
	return hoge === fuga ? l : -1 ;
}


// This helper function computes the Greatest Common Divisor (GCD) of two non-negative integers
// 'm' and 'n' using the Euclidean algorithm.
function gcd ( m , n )
{
	// 'r' will store the remainder during the division process.
	var r ;

	// The Euclidean algorithm typically assumes the first number is greater than or equal to the second.
	// This block ensures that 'm' is always the larger (or equal) of the two numbers.
	if ( m < n )
	{
		r = m ; // Temporarily save the value of m.
		m = n ; // Assign the value of n to m.
		n = r ; // Assign the original value of m (now in r) to n.
	}

	// The core of the Euclidean algorithm: repeatedly divide m by n and replace m with n,
	// and n with the remainder, until the remainder is 0.
	while ( ( r = m % n ) != 0 )
	{
		m = n ; // The current divisor 'n' becomes the new 'm'.
		n = r ; // The remainder 'r' becomes the new 'n'.
	}

	// When the loop terminates, 'n' holds the GCD of the original 'm' and 'n'.
	return n ;
}


// This line reads input from standard input (typically from a file or piped stream),
// processes it using the 'Main' function, and then prints the result to standard output.
console.log( Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ) ;