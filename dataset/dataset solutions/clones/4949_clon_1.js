'use strict' ; /* Enforce strict parsing and error handling for cleaner code */

// This program processes input from standard input to determine if a specific condition holds true.

const inputs = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

// Parse the first line for R (rows) and C (columns)
const RC = inputs [ 0 ] . split ( ' ' ) . map ( Number ) ;
const R = RC [ 0 ] ; // The number of rows
const C = RC [ 1 ] ; // The number of columns

// Parse the second line for N (number of data points)
const N = parseInt ( inputs [ 1 ] ) ;

// Extract the remaining lines, which contain the actual data points
const rca = inputs . slice ( 2 ) ;

// Initialize flags to store computed 'distance' values (slopes) for different coordinate parities.
// 'false' indicates that the distance has not yet been determined for that category.
let dist_x_odd = false ,
	dist_x_even = false ,
	dist_y_odd = false ,
	dist_y_even = false ; // These variables will hold a numerical value once calculated, or remain false.

// Initialize Maps to store data points based on their coordinate parities.
// Each map stores entries where the key is a coordinate (row or column) and the value is an array [other_coordinate, value_a].
let map_x_odd = new Map ( ) ,
	map_x_even = new Map ( ) ,
	map_y_odd = new Map ( ) ,
	map_y_even = new Map ( ) ;

// Iterate through each of the N data points provided in the input.
for ( let i = 0 ; i < N ; i++ ) {
	// Parse the current data point line into r1, c1, and a1.
	let rcai = rca [ i ] . split ( ' ' ) ,
		r1 = parseInt ( rcai [ 0 ] ) ,
		c1 = parseInt ( rcai [ 1 ] ) ,
		a1 = parseInt ( rcai [ 2 ] ) ;
	
	// --- Begin Y-axis processing logic ---
	// Special handling if the number of rows (R) is exactly 2.
	if ( R === 2 ) {
		// If a data point for the current column (c1) has already been processed for Y-even.
		if ( map_y_even . has ( c1 ) ) {
			// Retrieve the previously stored data point [r2, a2] for this column.
			let ra2 = map_y_even . get ( c1 ) ,
				r2 = ra2 [ 0 ] ,
				a2 = ra2 [ 1 ] ;
			
			// Calculate the 'distance' or slope 'd' based on the two data points.
			let d = ( a2 - a1 ) / ( r2 - r1 ) ;
			
			// If dist_y_even has not been set yet, initialize it.
			if ( dist_y_even === false ) {
				dist_y_even = d ; // Assign the newly calculated 'd'
				
				// Validate all existing entries in map_y_even against the newly established 'd'.
				for ( let cra3 of map_y_even . entries ( ) ) {
					let c3 = cra3 [ 0 ] ,
						r3 = cra3 [ 1 ] [ 0 ] ,
						a3 = cra3 [ 1 ] [ 1 ] ;
					
					// Check the condition for validity. If invalid, print 'No' and exit.
					if ( a3 - d * ( r3 - 1 ) < 0 ||
						a3 + d * ( 2 - r3 ) < 0 ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				} // End of inner loop for validation
			} else { // If dist_y_even has already been set.
				// Check for consistency: if the current 'd' doesn't match the established one.
				if ( d !== dist_y_even ) {
					console . log ( 'No' ) ; // Inconsistency found, print 'No' and exit.
					process . exit ( ) ;
				}
			}
			
			// Final validation for the current data point (a1, r1) using the determined 'd'.
			if ( a1 - d * ( r1 - 1 ) < 0 ||
				a1 + d * ( 2 - r1 ) < 0 ) {
				console . log ( 'No' ) ; // Validation failed, print 'No' and exit.
				process . exit ( ) ;
			}
			
		} else { // No previous data point for c1 in map_y_even.
			// If dist_y_even has already been established (from other columns).
			if ( dist_y_even !== false ) {
				// Validate the current point against the established dist_y_even.
				if ( a1 - dist_y_even * ( r1 - 1 ) < 0 ||
					a1 + dist_y_even * ( 2 - r1 ) < 0 ) {
					console . log ( 'No' ) ;
					process . exit ( ) ;
				}
			}
			map_y_even . set ( c1 , [ r1 , a1 ] ) ; // Store the current point.
		}
		
	} else { // R is not 2 (i.e., R > 2), more complex logic based on row parity.
		if ( r1 % 2 === 0 ) { // Current row r1 is even.
			if ( map_y_even . has ( c1 ) ) {
				let ra2 = map_y_even . get ( c1 ) ,
					r2 = ra2 [ 0 ] ,
					a2 = ra2 [ 1 ] ;
				
				let d = ( a2 - a1 ) / ( ( r2 - r1 ) / 2 ) ; // Different 'd' calculation for R > 2.
				
				if ( dist_y_even === false ) {
					dist_y_even = d ;
					
					// Note: Original code iterates map_y_odd here, which seems like a potential bug or specific design choice.
					for ( let cra3 of map_y_odd . entries ( ) ) {
						let c3 = cra3 [ 0 ] ,
							r3 = cra3 [ 1 ] [ 0 ] ,
							a3 = cra3 [ 1 ] [ 1 ] ;
						
						if ( a3 - d * ( ( r3 / 2 ) - 1 ) < 0 ||
							a3 + d * Math . floor ( ( R - r3 ) / 2 ) < 0 ) {
							console . log ( 'No' ) ;
							process . exit ( ) ;
						}
					}
				} else {
					if ( d !== dist_y_even ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				if ( a1 - d * ( ( r1 / 2 ) - 1 ) < 0 ||
					a1 + d * Math . floor ( ( R - r1 ) / 2 ) < 0 ) {
					console . log ( 'No' ) ;
					process . exit ( ) ;
				}
				
			} else { // map_y_even does not have c1 for even r1.
				// Bug in original: attempts to use dist_y_even when it's `false` (not yet set).
				if ( dist_y_even === false ) {
					if ( a1 - dist_y_even * ( ( r1 / 2 ) - 1 ) < 0 ||
						a1 + dist_y_even * Math . floor ( ( R - r1 ) / 2 ) < 0 ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				map_y_even . set ( c1 , [ r1 , a1 ] ) ;
			}
		} else { // Current row r1 is odd.
			if ( map_y_odd . has ( c1 ) ) {
				let ra2 = map_y_odd . get ( c1 ) ,
					r2 = ra2 [ 0 ] ,
					a2 = ra2 [ 1 ] ;
				
				let d = ( a2 - a1 ) / ( ( r2 - r1 ) / 2 ) ;
				
				if ( dist_y_odd === false ) {
					dist_y_odd = d ;
					
					for ( let cra3 of map_y_odd . entries ( ) ) {
						let c3 = cra3 [ 0 ] ,
							r3 = cra3 [ 1 ] [ 0 ] ,
							a3 = cra3 [ 1 ] [ 1 ] ;
						
						if ( a3 - d * Math . floor ( r3 / 2 ) < 0 ||
							a3 + d * Math . floor ( ( R - r3 ) / 2 ) < 0 ) {
							console . log ( 'No' ) ;
							process . exit ( ) ;
						}
					}
				} else {
					if ( d !== dist_y_odd ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				if ( a1 - d * Math . floor ( ( r1 - 1 ) / 2 ) < 0 ||
					a1 + d * Math . floor ( ( R - r1 ) / 2 ) < 0 ) {
					console . log ( 'No' ) ;
					process . exit ( ) ;
				}
			} else { // map_y_odd does not have c1 for odd r1.
				
				// Bug in original: attempts to use dist_y_odd when it's `false` (not yet set).
				if ( dist_y_odd === false ) {
					if ( a1 - dist_y_odd * Math . floor ( r1 / 2 ) < 0 ||
						a1 + dist_y_odd * Math . floor ( ( R - r1 ) / 2 ) < 0 ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				map_y_odd . set ( c1 , [ r1 , a1 ] ) ;
			}
		}
	}
	
	// --- Begin X-axis processing logic (mirrors Y-axis logic) ---
	// Special handling if the number of columns (C) is exactly 2.
	if ( C === 2 ) {
		if ( map_x_even . has ( r1 ) ) {
			let ca2 = map_x_even . get ( r1 ) ,
				c2 = ca2 [ 0 ] ,
				a2 = ca2 [ 1 ] ;
			
			let d = ( a2 - a1 ) / ( c2 - c1 ) ;
			
			// Critical inconsistency in original code: checks for -1 here, but !== false later.
			if ( dist_x_even === -1 ) {
				dist_x_even = d ;
				
				for ( let rca3 of map_x_even . entries ( ) ) {
					let r3 = rca3 [ 0 ] ,
						c3 = rca3 [ 1 ] [ 0 ] ,
						a3 = rca3 [ 1 ] [ 1 ] ;
					
					if ( a3 - d * ( c3 - 1 ) < 0 ||
						a3 + d * ( C - c3 ) < 0 ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
			} else {
				if ( d !== dist_x_even ) {
					console . log ( 'No' ) ;
					process . exit ( ) ;
				}
			}
			if ( a1 - d * ( c1 - 1 ) < 0 ||
				a1 + d * ( C - c1 ) < 0 ) {
				console . log ( 'No' ) ;
				process . exit ( ) ;
			}
			
		} else { // No previous data point for r1 in map_x_even.
			// Here, it checks against `false`, which conflicts with the `-1` check above if C=2.
			if ( dist_x_even !== false ) {
				if ( a1 - dist_x_even * ( c1 - 1 ) < 0 ||
					a1 + dist_x_even * ( C - c1 ) < 0 ) {
					console . log ( 'No' ) ;
					process . exit ( ) ;
				}
			}
			map_x_even . set ( r1 , [ c1 , a1 ] ) ;
		}
	} else { // C is not 2 (i.e., C > 2), more complex logic based on column parity.
		if ( c1 % 2 == 0 ) { // Current column c1 is even.
			if ( map_x_even . has ( r1 ) ) {
				let ca2 = map_x_even . get ( r1 ) ,
					c2 = ca2 [ 0 ] ,
					a2 = ca2 [ 1 ] ;
				
				let d = ( a2 - a1 ) / ( ( c2 - c1 ) / 2 ) ;
				
				if ( dist_x_even === false ) {
					dist_x_even = d ;
					
					for ( let rca3 of map_x_even . entries ( ) ) {
						let r3 = rca3 [ 0 ] ,
							c3 = rca3 [ 1 ] [ 0 ] ,
							a3 = rca3 [ 1 ] [ 1 ] ;
						
						if ( a3 - d * ( ( c3 / 2 ) - 1 ) < 0 ||
							a3 + d * Math . floor ( ( C - c3 ) / 2 ) < 0 ) {
							console . log ( 'No' ) ;
							process . exit ( ) ;
						}
					}
				} else {
					if ( d !== dist_x_even ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				if ( a1 - d * ( ( c1 / 2 ) - 1 ) < 0 ||
					a1 + d * Math . floor ( ( C - c1 ) / 2 ) < 0 ) {
					console . log ( 'No' ) ;
					process . exit ( ) ;
				}
			} else { // map_x_even does not have r1 for even c1.
				if ( dist_x_even !== false ) {
					if ( a1 - dist_x_even * ( ( c1 / 2 ) - 1 ) < 0 ||
						a1 + dist_x_even * Math . floor ( ( C - c1 ) / 2 ) < 0 ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				map_x_even . set ( r1 , [ c1 , a1 ] ) ;
			}
			
		} else { // Current column c1 is odd.
			if ( map_x_odd . has ( r1 ) ) {
				let ca2 = map_x_odd . get ( r1 ) ,
					c2 = ca2 [ 0 ] ,
					a2 = ca2 [ 1 ] ;
				
				let d = ( a2 - a1 ) / ( ( c2 - c1 ) / 2 ) ;
				
				if ( dist_x_odd === false ) {
					dist_x_odd = d ;
					
					for ( let rca3 of map_x_odd . entries ( ) ) {
						let r3 = rca3 [ 0 ] ,
							c3 = rca3 [ 1 ] [ 0 ] ,
							a3 = rca3 [ 1 ] [ 1 ] ;
						
						if ( a3 - d * Math . floor ( c3 / 2 ) < 0 ||
							a3 + d * Math . floor ( ( C - c3 ) / 2 ) < 0 ) {
							console . log ( 'No' ) ;
							process . exit ( ) ;
						}
					}
				} else {
					if ( d !== dist_x_odd ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				if ( a1 - d * Math . floor ( c1 / 2 ) < 0 ||
					a1 + d * Math . floor ( ( C - c1 ) / 2 ) < 0 ) {
					console . log ( 'No' ) ;
					process . exit ( ) ;
				}
			} else { // map_x_odd does not have r1 for odd c1.
				
				if ( dist_x_odd !== false ) {
					if ( a1 - dist_x_odd * Math . floor ( c1 / 2 ) < 0 ||
						a1 + dist_x_odd * Math . floor ( ( C - c1 ) / 2 ) < 0 ) {
						console . log ( 'No' ) ;
						process . exit ( ) ;
					}
				}
				map_x_odd . set ( r1 , [ c1 , a1 ] ) ;
			}
		}
	}
}

// If the program completes the loop without any 'No' conditions being met,
// then all conditions are satisfied.
console . log ( 'Yes' ) ;