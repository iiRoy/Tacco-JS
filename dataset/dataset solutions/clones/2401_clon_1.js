function Main ( input ) {
// This is a cloned version of the original JavaScript code.
// Its purpose is to demonstrate a Type I clone, where only
// whitespace and comments are altered, while preserving
// all functional aspects, variable names, and logic.

var inputs = input . split ( "\n" ) ;

// The first line of input contains N and M, separated by a space.
var nAndm = inputs [ 0 ] . split ( " " ) ;

// N represents the total number of cells.
var n = nAndm [ 0 ] - 0 ;

// M represents the maximum jump distance.
var m = nAndm [ 1 ] - 0 ;

// The second line of input is a string representing the cells,
// split into individual characters (e.g., '0' or '1').
var s = inputs [ 1 ] . split ( "" ) ;



// --- Phase 1: Determine an initial, potentially sub-optimal, path ---
// This phase aims to find *any* valid path to the end,
// prioritizing reaching the destination by taking individual
// steps as allowed, without necessarily optimizing for length.

var base = [ ] ; // Stores the sequence of jump lengths for this initial path.

var i = 0 ; // 'i' tracks the current position in the cells array.

while ( i < n - 1 ) { // Loop continues until the destination (n-1) is reached.

var j ; // 'j' will store the length of the current jump.

// Attempt to find a valid jump from the current position 'i'.
for ( j = 1 ; j <= m ; j ++ ) {

// A valid jump lands on a cell marked '0'.
if ( s [ i + j ] == 0 ) {

i += j ; // Advance the current position.
base . push ( j ) ; // Record the jump length.
break ; // Exit the inner loop, as a valid jump was found.
}

}

// If 'j' exceeds 'm', it means no valid jump was found
// within the maximum allowed distance 'm'.
if ( j > m ) { // This indicates an impossible scenario.

console . log ( -1 ) ; // Output -1 as no solution exists.
return ; // Terminate the function execution.
}

}



// The following 'bests' array and 'searchRoute' function
// appear to be part of an alternative or incomplete approach
// that is not used in the final output generation.
var bests = [ ] ;

var searchRoute = function ( route ) {

var flag = false ;

for ( var i = 0 ; i < route . length - 1 ; i ++ ) {

if ( route [ i ] + route [ i + 1 ] <= m ) {

var array = Array . from ( route ) ;
array [ i ] += array [ i + 1 ] ;
array . splice ( i + 1 , 1 ) ;
searchRoute ( array ) ;
flag = true ;
}

}

if ( ! flag && route . length <= simple . length ) {
bests . push ( Array . from ( route ) ) ;
}

} ;



// --- Phase 2: Optimize the initial path by combining jumps ---
// This phase takes the 'base' path and attempts to combine
// consecutive jumps if their sum does not exceed 'm',
// effectively reducing the total number of jumps.

var p = base . length - 1 ; // 'p' is an index, starting from the end of the 'base' path.

var simple = [ ] ; // This array will store the optimized (combined) jump lengths.

while ( p >= 0 ) { // Iterate backwards through the 'base' path.

var value = base [ p ] ; // Initialize 'value' with the current jump length.

// Attempt to combine 'value' with preceding jumps from 'base'.
// The 'p--' decrements 'p' after its use in the condition.
while ( ( p -- ) >= 0 && value + base [ p ] <= m ) {

value += base [ p ] ; // Add the preceding jump length to 'value'.
}

// After combining as much as possible, add the resulting 'value'
// to the front of the 'simple' array to maintain correct order.
simple . unshift ( value ) ;

}

// Output the optimized sequence of jump lengths,
// joined together as a single string.
console . log ( simple . join ( "" ) ) ;

}

// Read input from standard input and call the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;