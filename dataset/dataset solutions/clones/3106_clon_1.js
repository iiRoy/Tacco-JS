'use strict' // Enforce strict mode for cleaner code and fewer errors.

// This is the primary class containing the solution logic for the problem.
class Main {

  // The main execution method where the problem-solving algorithm resides.
  solve(  ) {
    /*
     * Define the modulus constant. This is commonly used in competitive programming
     * to prevent integer overflow in calculations involving large numbers.
     */
    const mod = 1e9 + 7; // A large prime number often used as a modulo.

    // Read the input 'n' which represents the length of the sequence to be constructed.
    // The 'parseInt' function converts the string input to an integer.
    const n = parseInt( input.nextLine( ) );

    // 'chars' array holds the allowed characters for building the sequence.
    const chars = [ 'A' , 'T' , 'G' , 'C' ]; // DNA bases.

    /*
     * 'ng' (No-Go) array defines patterns that are forbidden in the sequence.
     * Each pattern is converted into a regular expression for efficient matching.
     * The '.' in patterns acts as a wildcard, matching any single character.
     */
    const ng = [ '.AGC' , 'AG.C' , 'A.GC' , '.GAC' , '.ACG' ].map( (p) => new RegExp(p) );

    // 'dp' is our dynamic programming table. It will store the number of valid sequences.
    const dp = [ ];
    // Initialize each row of the DP table as an empty object (or array, depending on access pattern).
    for ( let i = 0 ; i <= n ; ++i ) {
      dp[i] = [ ];
    }

    // Set the base case for the DP. At length 0, the "TTT" prefix (conceptual) has 1 way.
    // This often represents an initial state or a "padding" for the patterns.
    dp[0]['TTT'] = 1;

    // The core dynamic programming loop.
    // 'i' represents the current length of the sequence being built.
    for ( let i = 1 ; i <= n ; ++i ) {

      // Iterate through each possible character that can be appended to the sequence.
      for ( const key of chars ) {

        // Iterate through all valid previous states (sequences of length i-1).
        for ( const prev in dp[i-1] ) {

          // Check if adding 'key' to 'prev' creates any of the forbidden 'ng' patterns.
          if ( ng.some( ( p ) => p.test( prev + key ) ) ) {
            continue; // If a forbidden pattern is found, skip this combination.
          };

          // Construct the current state 'cur'. This typically takes the last two characters
          // of 'prev' and appends 'key' to maintain a fixed-length "window" for checking patterns.
          const cur = prev.substr(1) + key;

          // Initialize the count for 'dp[i][cur]' to 0 if it hasn't been set yet.
          dp[i][cur] = dp[i][cur] !== undefined ? dp[i][cur] : 0;

          // Add the count from the previous state to the current state's count.
          dp[i][cur] += dp[i-1][prev];

          // Apply the modulo operation to keep the number within the defined range.
          dp[i][cur] %= mod;
        }
      }
    }

    // After filling the DP table, collect all the counts from the final length 'n'.
    let ret = [ ];

    // Iterate through the keys (states) in the last row of the DP table.
    for ( let k in dp[n] ) {
      ret.push( dp[n][k] );
    }

    // Sum all collected counts from the final DP states, applying modulo at each step of reduction.
    // The result is then printed to the console.
    console.log( ret.reduce( (a,b)=>(a+b) % mod ) );
  }

}

/*
* This extensive section provides a set of utility methods,
* partially inspired by or ported from the popular Underscore.js library.
* These methods are designed to simplify common array and collection manipulations.
*/
class Underscore {
	// Calculates the sum of all numeric elements within a given array.
	sum( arr ) {
		return arr.reduce(( a , b ) => a + b );
	}

	// Determines the minimum element in an array.
	// An optional 'func' can be provided for custom comparison logic.
	min( arr , func ) {
		if ( func == null ) {
			func = ( a , b ) => a - b
		}
		return arr.reduce( ( a , b ) => func(a,b) < 0 ? a : b );
	}

	// Identifies the maximum element in an array, similar to 'min' but for maximum.
	max( arr , func ) {
		if ( func == null ) {
			func = ( a , b ) => a - b
		}
		return arr.reduce( ( a , b ) => func(a,b) > 0 ? a : b );
	}

	// Generates an array of numbers within a specified range.
	// Supports 'start', 'stop', and 'step' parameters.
	range( start , stop , step ) {
		if ( stop == null ) {
			stop = start || 0;
			start = 0;
		}
		if ( !step ) {
			step = stop < start ? -1 : 1;
		}
		const length = Math.max( Math.ceil( ( stop - start ) / step ) , 0 );
		const range = Array( length );

		for ( var idx = 0 ; idx < length ; idx++ , start += step ) {
			range[idx] = start;
		}
		return range;
	}

	// Retrieves the first element(s) of an array.
	// If 'n' is provided, returns the first 'n' elements.
	first ( array , n ) {
		if ( array == null || array.length < 1 ) return n == null ? void 0 : [ ];
		if ( n == null ) return array[0];
		return this.initial( array , array.length - n );
	};

	// Returns all but the last 'n' elements of an array.
	// If 'n' is not provided, returns all but the last element.
	initial ( array , n ) {
		return array.slice.call( array , 0 , Math.max( 0 , array.length - ( n == null ? 1 : n ) ) );
	}

	// Returns a new array containing all elements after the first 'n' elements.
	// If 'n' is not provided, returns all but the first element.
	tail( array , n ) {
		return array.slice.call( array , n == null ? 1 : n );
	}

	// Retrieves the last element(s) of an array.
	// If 'n' is provided, returns the last 'n' elements.
	last ( array , n ) {
		if ( n == null ) return array[ array.length - 1 ];
		return this.tail( array , Math.max( 0 , array.length - n ) );
	}

	// Computes an array where each element is the cumulative sum up to that point.
	sumArray ( arr ) {
		return this.tail( arr.reduce( ( ( a , b , i ) => { a.push( b + a[i] ); return a } ) , [0] ) );
	}

	// Performs a binary search on a sorted array.
	// 'iteratee' can specify a property to search on for objects in the array.
	binarySearch ( array , key , iteratee ) {
		const itr = ( obj ) => ( typeof obj === 'object' ) ? obj[iteratee] : obj;
		// NOTE: The original code has a potential bug here where 'obj' is undefined.
		// For Type I clone, this must be preserved exactly as is.
		const value = itr( obj );
		let low = 0 , high = array.length;
		while ( low < high ) {
			let mid = Math.floor( ( low + high ) / 2 );
			if ( itr( array[mid] ) < value ) low = mid + 1; else high = mid;
		}
		return low;
	};
}
// Create a singleton instance of the Underscore utility class for global access.
const _ = new Underscore( );

/*
* The Input class is designed to handle reading various formats of input
* from standard input, making it easier to parse data for competitive programming.
*/
class Input {
	constructor( ) {
		this.cursor = 0; // Initializes a pointer to track the current line being read.
		this.inputAll( ); // Reads all available input when an instance is created.
	}

	// Reads the entire content of '/dev/stdin', splits it by newline, and stores it.
	inputAll( ) {
		this.data = ( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ).split( '\n' );
		return this.data;
	}

	/*
	* Retrieves one or more lines from the input data.
	* If 'n' is provided, it returns an array of 'n' lines.
	* Otherwise, it returns a single line.
	*/
	nextLine( n ) {
		if ( n ) {
			const ret = this.data.slice( this.cursor , this.cursor + n );
			this.cursor += n;
			return ret;
		}
		return this.data[ this.cursor++ ];
	}

	/*
	* Reads a single line and splits it into an array of strings,
	* typically separated by spaces.
	*/
	nextStrArr( ) {
		return this.nextLine( ).split( ' ' );
	}

	/*
	* Reads a single line, splits it into strings, and then parses each
	* string into an integer, returning an array of integers.
	*/
	nextIntArr( ) {
		return this.nextStrArr( ).map( ( e ) => parseInt( e ) );
	}

	/*
	* Reads a single line, splits it into strings, and then parses each
	* string into a floating-point number, returning an array of floats.
	*/
	nextFloatArr( ) {
		return this.nextStrArr( ).map( ( e ) => parseFloat( e ) );
	}

	/*
	* Reads 'n' lines, and for each line, parses it into an integer.
	* Returns an array of integers.
	*/
	nextIntLine( n ) {
		return this.nextLine( n ).map( ( e ) => parseInt( e ) )
	}

	/*
	* Reads 'n' lines, and for each line, parses it into a floating-point number.
	* Returns an array of floats.
	*/
	nextFloatLine( n ) {
		return this.nextLine( n ).map( ( e ) => parseFloat( e ) )
	}

	/*
	* Reads 'n' lines, and for each line, splits it into an array of strings.
	* Returns a 2D array of strings.
	*/
	nextStrRange( n ) {
		return this.nextLine( n ).map( ( line ) => line.split( ' ' ) );
	}

	/*
	* Reads 'n' lines, and for each line, splits it into strings and then
	* parses each string into an integer. Returns a 2D array of integers.
	*/
	nextIntRange( n ) {
		return this.nextLine( n ).map( ( line ) => line.split( ' ' ).map( ( e ) => parseInt( e ) ) );
	}

	/*
	* Reads 'n' lines, and for each line, splits it into strings and then
	* parses each string into a floating-point number. Returns a 2D array of floats.
	*/
	nextFloatRange( n ) {
		return this.nextLine( n ).map( ( line ) => line.split( ' ' ).map( ( e ) => parseFloat( e ) ) );
	}
}
// Create a global instance of the Input class, making input functions readily available.
const input = new Input( );

// Instantiate the Main class and immediately invoke its 'solve' method to start the program.
( new Main( ) ).solve( );