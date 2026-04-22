var GET = ( function( ) {
  // This is the factory function 'f' for the GET object.
  // It creates and returns a new instance of the 'g' object.
  function f(s) {
    return new g(s) ;
  }

  // This is the constructor function 'g' for the GET object.
  // It initializes the internal state based on the input string 's'.
  function g(s) {
    this._s = s.trim( ).split( "\n" ) ; // Split the trimmed string into lines.
    this._y = 0 ;                       // Initialize the line pointer.
  }

  // Prototype method 'a' for retrieving an item from the current line.
  g . prototype . a = function( f ) {
    var s = this._s , // Reference to the array of lines.
        y = this._y , // Current line index.
        r ;           // Variable to hold the result.

    /*
     * If the current line 's[y]' is still a string, it means it hasn't been
     * processed yet. Split it by space and reverse it for easy 'pop' access.
     */
    if ( typeof s[y] === "string" ) {
      s[y] = s[y].split( " " ).reverse( ) ;
    }

    r = s[y].pop( ) ; // Get the last element from the current line.

    // If the current line is exhausted, move to the next line.
    if ( ! s[y].length ) {
      this._y ++ ;
    }

    // Return the raw string 'r' if 'f' is true, otherwise convert to number.
    return f ? r : + r ;
  } ;

  // Prototype method 'l' for retrieving an entire line.
  g . prototype . l = function( f ) {
    // Get the current line, split it by space, and then increment the line pointer.
    var s = this._s[ this._y ++ ].split( " " ) ;

    // Return the array of strings if 'f' is true, otherwise convert all elements to numbers.
    return f ? s : s . map( a => + a ) ;
  } ;

  // Prototype method 'm' for retrieving a matrix (multiple lines, multiple columns).
  g . prototype . m = function( n , f ) {
    /*
     * Slice 'n' lines from the current position, then map each line to an
     * array of strings by splitting it. Increment the line pointer by 'n'.
     */
    var r = this._s.slice( this._y , this._y += n ) . map( a => a.split( " " ) ) ;

    // Return the matrix of strings if 'f' is true, otherwise convert all elements to numbers.
    return f ? r : r . map( a => a . map( a => + a ) ) ;
  } ;

  // Prototype method 'r' for retrieving a range of lines.
  g . prototype . r = function( n , f ) {
    /*
     * Slice 'n' lines from the current position.
     * Increment the line pointer by 'n'.
     */
    var r = this._s.slice( this._y , this._y += n ) ;

    // Return the array of strings if 'f' is true, otherwise convert all elements to numbers.
    return f ? r : r . map( a => + a ) ;
  } ;

  // The IIFE returns the factory function 'f'.
  return f ;
} ) ( ) ;

// Initialize the 'o' object by reading from standard input.
var o = GET( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;

/**
 * Creates a multi-dimensional array initialized with a specific value 'v'.
 * The dimensions are passed as arguments after 'v'.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 */
function xArray( v ) {
  var a = arguments , // All arguments passed to the function.
      l = a . length , // Total number of arguments.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation.

  // Loop to build the outer array dimensions.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  // Evaluate the constructed string to create the array.
  return eval( r ) ;
}

// UnionFind data structure implementation (IIFE).
var UnionFind = ( function( ) {
  // Internal array to store parent/size information.
  var a ;

  // Factory function to create a new UnionFind instance.
  function f( n ) {
    return new UnionFind( n ) ;
  }

  // Constructor for the UnionFind data structure.
  function UnionFind( n ) {
    // Initialize the array with -1 for each element, indicating it's a root.
    a = this . a = Array( n + 1 ) . fill( -1 ) ;
  }

  // Finds the root of the set containing element 'i'.
  // Performs path compression during traversal.
  UnionFind . prototype . root = function( i ) {
    if ( a[i] < 0 ) {
      return i ; // 'i' is the root if its value is negative.
    }
    // Path compression: set parent of 'i' directly to the root.
    return a[i] = this . root( a[i] ) ;
  } ;

  // Checks if two elements 'x' and 'y' are in the same set.
  UnionFind . prototype . same = function( x , y ) {
    return this . root( x ) === this . root( y ) ;
  } ;

  // Unites the sets containing elements 'x' and 'y'.
  // Returns true if a union occurred, false otherwise.
  UnionFind . prototype . unite = function( x , y ) {
    x = this . root( x ) ; // Find the root of 'x'.
    y = this . root( y ) ; // Find the root of 'y'.

    if ( x === y ) {
      return false ; // Already in the same set.
    }

    // Union by size/rank heuristic. Attach smaller tree to larger tree.
    if ( x < y ) {
      a[x] += a[y] ; // Update size of the new root.
      a[y] = x ;     // Make 'x' the parent of 'y'.
    } else {
      a[y] += a[x] ; // Update size of the new root.
      a[x] = y ;     // Make 'y' the parent of 'x'.
    }
    return true ; // Union successful.
  } ;

  // Returns the size of the set containing element 'i'.
  UnionFind . prototype . size = function( i ) {
    return - a[ this . root( i ) ] ; // Size is stored as negative value at root.
  } ;

  // The IIFE returns the factory function 'f'.
  return f ;
} ) ( ) ;


// Rolling Hash data structure for string matching (IIFE).
var RollingHash = ( function( ) {
  // Base for polynomial hashing.
  var base = 1007 ;
  // Two different prime moduli for collision reduction.
  var mod = [ 94906249 , 94906247 ] ;
  // Precomputed powers of base modulo 'mod'.
  var pow = [ [ 1 ] , [ 1 ] ] ;
  // Precomputed prefix hashes modulo 'mod'.
  var hash = [ [ 0 ] , [ 0 ] ] ;
  // Size of the string being hashed.
  var size ;

  // Factory function to create a new RollingHash instance.
  function f( s ) {
    return new RollingHash( s ) ;
  }

  // Constructor for the RollingHash object.
  function RollingHash( s ) {
    size = this . size = s . length ; // Set the string size.

    // Iterate over each modulus.
    for ( var j = 0 ; j < mod . length ; j ++ ) {
      pow[j] . length = hash[j] . length = size + 1 ; // Resize arrays.

      // Precompute powers and prefix hashes.
      for ( var i = 0 ; i < size ; i ++ ) {
        pow[j][ i + 1 ] = pow[j][i] * base % mod[j] ;
        hash[j][ i + 1 ] = ( hash[j][i] * base + s . charCodeAt( i ) ) % mod[j] ;
      }
    }
  }

  // Finds the first occurrence of string 's' in the current hashed string, starting from index 'k'.
  RollingHash . prototype . find = function( s , k ) {
    var t = getStrHash( s ) ; // Get hash of the pattern string 's'.
    var len = s . length ;    // Length of the pattern.
    var m = mod . length ;    // Number of moduli.
    var n = size - len + 1 ;  // Number of possible starting positions.

    // Iterate through all possible starting positions.
    for ( var i = k ; i < n ; i ++ ) {
      // Check the hash for the first modulus.
      if ( get( i , i + len , 0 ) === t[0] ) {
        var f = 1 ; // Flag to count matches.
        // Check hashes for remaining moduli.
        for ( var j = 1 ; j < m ; j ++ ) {
          if ( get( i , i + len , j ) !== t[j] ) {
            break ; // Mismatch found, break inner loop.
          }
          f ++ ; // Increment match count.
        }
        if ( f === m ) {
          return i ; // All moduli matched, return starting index.
        }
      }
    }
    return -1 ; // Pattern not found.
  } ;

  // Checks if the substring from 'i' to 'i + sLen' has the given hash 'sHash'.
  RollingHash . prototype . hashCheck = function( sHash , sLen , i ) {
    for ( var j = 0 ; j < mod . length ; j ++ ) {
      // Get the hash of the current substring.
      var t = get( i , i + sLen , j ) ;
      // Compare with the provided hash.
      if ( get( i , i + sLen , j ) !== sHash[j] ) {
        return 0 ; // Mismatch.
      }
    }
    return 1 ; // All hashes matched.
  } ;

  // Adds a string 's' to the end of the current hashed string.
  RollingHash . prototype . add = function( s ) {
    var oldSize = size ; // Store the original size.
    size = this . size = size + s . length ; // Update total size.

    // Iterate over each modulus.
    for ( var j = 0 ; j < mod . length ; j ++ ) {
      pow[j] . length = hash[j] . length = size + 1 ; // Resize arrays.

      // Compute new powers and prefix hashes for the added string.
      for ( var i = oldSize ; i < size ; i ++ ) {
        pow[j][ i + 1 ] = pow[j][i] * base % mod[j] ;
        hash[j][ i + 1 ] = ( hash[j][i] * base + s . charCodeAt( i - oldSize ) ) % mod[j] ;
      }
    }
    return size ; // Return the new total size.
  } ;

  // Helper function: Computes the hash of a given string 's'.
  function getStrHash( s ) {
    var r = [ ] ; // Array to store hashes for each modulus.

    for ( var j = 0 ; j < mod . length ; j ++ ) {
      var t = 0 ; // Current hash value.
      for ( var i = 0 ; i < s . length ; i ++ ) {
        t = ( t * base + s . charCodeAt( i ) ) % mod[j] ;
      }
      r . push( t ) ;
    }
    return r ;
  }

  // Helper function: Computes the hash of a substring from 'l' to 'r' using the j-th modulus.
  function get( l , r , j ) {
    // Calculate the hash using prefix hashes and precomputed powers.
    var t = ( hash[j][r] - hash[j][l] * pow[j][ r - l ] ) % mod[j] ;
    // Ensure the result is non-negative.
    return t < 0 ? t + mod[j] : t ;
  }

  // Expose the getStrHash function as a static method of the factory function.
  f . getStrHash = getStrHash ;

  // The IIFE returns the factory function 'f'.
  return f ;
} ) ( ) ;

// Execute the main function and print its result to the console.
console . log( main( ) ) ;

// The main logic of the program.
function main( ) {
  var s = o . a( 1 ) ; // Read the first string 's'.
  var t = o . a( 1 ) ; // Read the second string 't'.

  var sl = s . length ; // Length of string 's'.
  var tl = t . length ; // Length of string 't'.

  // Create a doubled version of 's' to facilitate circular checks.
  var ss = s + s ;

  // Extend 'ss' further if needed to ensure it's long enough for rolling hash checks.
  while ( ss . length < sl + tl ) {
    ss += s ;
  }

  var uf = UnionFind( sl ) ; // Initialize UnionFind for 'sl' elements.
  var rh = RollingHash( ss ) ; // Initialize RollingHash with the extended string 'ss'.

  var tHash = RollingHash . getStrHash( t ) ; // Get the hash of string 't'.

  // Iterate through all possible starting positions in 's'.
  for ( var i = 0 ; i < sl ; i ++ ) {
    // If a match for 't' is found starting at index 'i' in 'ss'.
    if ( rh . hashCheck( tHash , tl , i ) ) {
      // Attempt to unite 'i' with the end position of the match, cyclically.
      // If they are already united, it means a cycle is formed, return -1.
      if ( ! uf . unite( i , ( i + tl ) % sl ) ) {
        return -1 ;
      }
    }
  }

  var ans = 1 ; // Initialize answer with a minimum of 1.

  // Find the maximum size of any connected component in the UnionFind structure.
  for ( i = 0 ; i < sl ; i ++ ) {
    var currentSize = uf . size( i ) ;
    if ( ans < currentSize ) {
      ans = currentSize ;
    }
  }

  // The problem asks for the minimum number of distinct characters needed,
  // which corresponds to the largest connected component minus 1 (as one component is a cycle).
  return ans - 1 ;
}