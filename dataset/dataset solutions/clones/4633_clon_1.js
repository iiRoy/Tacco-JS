/* This is a Type I clone of the original JavaScript code.
 * It preserves all logical and structural elements,
 * including identifiers, operators, and expressions.
 * Only whitespace (indentation, spacing, blank lines)
 * and comments have been extensively altered to create a visually distinct,
 * yet functionally identical, version of the code.
 */

'use strict'
// This directive enforces strict mode for the entire script.

class Main {

  // The main entry point for the problem solution.
  solve( ) {
    // Read N, L, and T from the first line of input.
    const nlt = input.nextIntArr( );

    const N = nlt[0];
    const L = nlt[1];
    const T = nlt[2];

    // Read ant positions (x) and directions (w) for N ants.
    const xwList = input.nextIntRange(N);

    // Calculate the final position of each ant if they could pass through each other.
    // (x + (direction * T) + 2 * L) % L ensures positive modulo result
    const lastPos = xwList
      .map( xw => (xw[0] + (xw[1] == 1 ? T : -T) + 2 * L) % L );

    /*
     * Calculate the number of times the first ant (ant 0)
     * "effectively" crosses another ant, considering they pass through each other.
     * This determines the final shifted index of ant 0.
     */
    let sum = 0;

    // The first ant's initial position and direction.
    const xw0 = xwList[0];

    // Iterate through all other ants to count crossings.
    for ( let i = 1; i < N; ++i ) {
      const xw = xwList[i];

      // If ants move in the same direction, they never "collide" or cross.
      if ( xw[1] === xw0[1] ) continue;

      // Effective relative speed is 2 (one ant moves towards the other, or away if both move).
      // Calculate initial distance between ant 0 and ant i.
      // If ant 0 moves right (1), distance is xw[0] - xw0[0].
      // If ant 0 moves left (-1), distance is (L - xw[0]) + xw0[0].
      const d = xw0[1] === 1 ? xw[0] - xw0[0] : (nlt[1] - xw[0]) + xw0[0];

      /*
       * Determine how many times ant i effectively passes ant 0.
       * This is based on the relative distance covered (2 * T) and the track length L.
       * We're looking for the largest 'x' such that:
       * 2 * T >= (x * L) + d
       * Rearranging for x:
       * x <= (2 * T - d) / L
       *
       * The formula (2 * T + L - d) / L | 0 effectively calculates ceil((2*T - d)/L)
       * if 2*T - d > 0, or just handles the floor correctly for negative results if it were possible.
       * It's essentially the number of full laps difference.
       */
      const x = ( 2 * T + L - d ) / L | 0;

      // Accumulate the crossings.
      sum += x;
      // Keep sum within [0, N-1] range using modulo N.
      sum %= N;
    }

    // Now, determine the final permutation of ants.
    // The ant that started at index `i` will end up at an effective index:
    // (original_index + (shift_due_to_collisions) + N) % N
    // The shift for ant 0 is 'sum' if it moves right, or '-sum' if it moves left.
    const lastAnts = lastPos.map( ( e, i ) => [ ( i + ( xw0[1] === 1 ? sum : -sum ) + N ) % N, e ] );

    // Sort the final ant positions based on their *final effective indices*.
    lastAnts.sort( ( a, b ) => a[0] - b[0] );

    // Extract only the final positions and join them with newlines.
    return lastAnts.map( e => e[1] ).join('\n');
  }
} // End of Main class definition.


// Helper class for modular arithmetic operations.
class Mod {
  // Constructor initializes with a given modulo or a default one.
  constructor( mod ) {
    if ( mod == null ) {
      mod = Combinatorics.DefaultMod; // Assuming Combinatorics.DefaultMod exists elsewhere.
    }
    this.mod = mod;
  }

  // Modular multiplication.
  mult( a, b ) {
    let ret = 0;
    a %= this.mod;
    b %= this.mod;

    while ( b ) {
      if ( b & 1 ) { // If b is odd
        ret += a;
        if ( ret >= this.mod ) {
          ret -= this.mod;
        }
      }
      a <<= 1; // a = a * 2
      if ( a >= this.mod ) {
        a -= this.mod;
      }
      b >>= 1; // b = b / 2
    }
    return ret;
  }

  // Modular exponentiation (a^b % mod).
  pow( a, b ) {
    let ret = 1;
    while ( b ) {
      if ( b & 1 ) {
        ret = this.mult(ret, a);
      }
      a = this.mult(a, a);
      b >>= 1;
    }
    return ret;
  }
}
// Global instance of Mod for a common modulo (10^9 + 7).
const MOD = new Mod(1e9 + 7);


// Utility class providing various array and collection manipulation functions.
class Underscore {
  // Sums all elements in an array.
  sum( arr ) {
    return arr.reduce( ( a, b ) => a + b );
  }

  // Sums all elements in an array modulo a given value.
  modSum( arr, mod ) {
    if ( mod == null ) {
      mod = MOD.mod;
    }
    return arr.reduce( ( a, b ) => ( a + b ) % mod );
  }

  // Finds the minimum element in an array using an optional comparator function.
  min( arr, func ) {
    if ( func == null ) {
      func = ( a, b ) => a - b;
    }
    return arr.reduce( ( a, b ) => func(a, b) < 0 ? a : b );
  }

  // Finds the maximum element in an array using an optional comparator function.
  max( arr, func ) {
    if ( func == null ) {
      func = ( a, b ) => a - b;
    }
    return arr.reduce( ( a, b ) => func(a, b) > 0 ? a : b );
  }

  // Sorts an array using an optional comparator function.
  sort( arr, func ) {
    if ( func == null ) {
      func = ( a, b ) => a - b;
    }
    return arr.sort(func);
  }

  // Generates a range of numbers.
  range( start, stop, step ) {
    if ( stop == null ) {
      stop = start || 0;
      start = 0;
    }
    if ( !step ) {
      step = stop < start ? -1 : 1;
    }
    const length = Math.max( Math.ceil( ( stop - start ) / step ), 0 );
    const range = Array(length);
    for ( let idx = 0; idx < length; idx++, start += step ) {
      range[idx] = start;
    }
    return range;
  }

  // Returns the first element or the first 'n' elements of an array.
  first ( array, n ) {
    if ( array == null || array.length < 1 ) return n == null ? void 0 : [];
    if ( n == null ) return array[0];
    return this.initial( array, array.length - n );
  }

  // Returns all but the last 'n' elements of an array.
  initial ( array, n ) {
    return array.slice.call( array, 0, Math.max( 0, array.length - ( n == null ? 1 : n ) ) );
  }

  // Returns all but the first 'n' elements of an array.
  tail( array, n ) {
    return array.slice.call( array, n == null ? 1 : n );
  }

  // Returns the last element or the last 'n' elements of an array.
  last ( array, n ) {
    if ( n == null ) return array[array.length - 1];
    return this.tail( array, Math.max( 0, array.length - n ) );
  }

  // Calculates a cumulative sum array.
  sumArray ( arr ) {
    return this.tail( arr.reduce( ( ( a, b, i ) => { a.push(b + a[i]); return a; } ), [0] ) );
  }

  // Calculates an array of differences between consecutive elements.
  diffArray ( arr ) {
    const s = [];
    for ( let i = 1; i < arr.length; ++i ) {
      s.push( arr[i] - arr[i-1] );
    }
    return s;
  }

  // Performs a binary search on a sorted array.
  binarySearch ( array, key, iteratee ) {
    const itr = ( obj ) => ( typeof obj === 'object' ) ? obj[iteratee] : obj;
    const value = itr(key); // Use 'key' as the object for iteratee, not 'obj'
    let low = 0, high = array.length;
    while ( low < high ) {
      let mid = Math.floor( ( low + high ) / 2 );
      if ( itr(array[mid]) < value ) low = mid + 1;
      else high = mid;
    }
    return low;
  }
}
// Global instance of the Underscore utility class.
const _ = new Underscore();


// Class for handling input operations, reading from stdin.
class Input {
  // Constructor initializes cursor and reads all input.
  constructor() {
    this.cursor = 0;
    this.inputAll();
  }

  // Reads all data from standard input and splits it by newlines.
  inputAll() {
    this.data = ( require("fs").readFileSync("/dev/stdin", "utf8") ).split('\n');
    return this.data;
  }

  /* Reads a single line or 'n' lines of input. */
  nextLine( n ) {
    if ( n ) {
      const ret = this.data.slice( this.cursor, this.cursor + n );
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }

  /* Reads a single integer from the current line. */
  nextInt() {
    return parseInt( this.nextLine() );
  }

  /* Reads a line and returns an array of strings. */
  nextStrArr() {
    return this.nextLine().split(' ');
  }

  /* Reads a line and returns an array of integers. */
  nextIntArr() {
    return this.nextStrArr().map( ( e ) => parseInt(e) );
  }

  /* Reads a line and returns an array of floats. */
  nextFloatArr() {
    return this.nextStrArr().map( ( e ) => parseFloat(e) );
  }

  /* Reads 'n' lines and returns an array of integers. */
  nextIntLine( n ) {
    return this.nextLine(n).map( ( e ) => parseInt(e) );
  }

  /* Reads 'n' lines and returns an array of floats. */
  nextFloatLine( n ) {
    return this.nextLine(n).map( ( e ) => parseFloat(e) );
  }

  /* Reads 'n' lines and returns a 2D array of strings. */
  nextStrRange( n ) {
    return this.nextLine(n).map( ( line ) => line.split(' ') );
  }

  /* Reads 'n' lines and returns a 2D array of integers. */
  nextIntRange( n ) {
    return this.nextLine(n).map( ( line ) => line.split(' ').map( ( e ) => parseInt(e) ) );
  }

  /* Reads 'n' lines and returns a 2D array of floats. */
  nextFloatRange( n ) {
    return this.nextLine(n).map( ( line ) => line.split(' ').map( ( e ) => parseFloat(e) ) );
  }
}
// Global instance for input reading.
const input = new Input();


// Helper function to print output to console, handling boolean conversions.
const Out = ( output ) => {
  let ret;
  if ( output == null ) return; // Do nothing if output is null or undefined.

  if ( output === true ) {
    ret = 'Yes';
  } else if ( output === false ) {
    ret = 'No';
  } else {
    ret = output; // For other types, use the output directly.
  }
  console.log(ret);
};

// Execute the main solution and print its result.
Out( new Main().solve() );
// End of script.