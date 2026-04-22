process.stdin.resume ( );
  process.stdin.setEncoding ( 'utf8' );



// This function implements a quicksort algorithm.
// It sorts an array of objects based on their 'A' property.
function qsort ( array ) {

  // The actual sorting logic is encapsulated in an immediately invoked function expression (IIFE).
  ( function sort ( start , end ) {


    // Base case for the recursion: if the segment is empty or a single element, do nothing.
    if ( start >= end ) {
      return ;
    }

    // Initialize left and right pointers for the current segment.
    var left = start ;

    var right = end ;


    // Choose a reference (pivot) element from the middle of the segment.
    // The 'A' property of the object is used for comparison.
    var reference = array [ Math.round ( ( left + right ) / 2 ) ] . A ;


    // Loop to partition the array around the reference element.
    while ( left < right ) {


      // Move 'left' pointer until an element greater than or equal to the reference is found.
      if ( array [ left ] . A >= reference ) {


        // Move 'right' pointer until an element less than or equal to the reference is found.
        while ( right > left ) {
          if ( array [ right ] . A <= reference ) {

            // Swap elements if they are on the wrong sides of the partition.
            var tmp = array [ left ] ;
            array [ left ] = array [ right ] ;
            array [ right ] = tmp ;

            // Decrement right pointer and break from inner loop after a swap.
            right -- ;
            break ;
          }
          // Continue decrementing right pointer if no swap occurred.
          right -- ;
        }
      }
      // Increment left pointer.
      left ++ ;
    }


    // Recursively sort the sub-arrays.
    // The conditions handle cases where the pivot element itself might need to be included in one of the sub-arrays.
    if ( array [ right ] . A > reference ) {
      sort ( start , right - 1 ) ;
      sort ( right , end ) ;
    } else if ( array [ right ] . A < reference ) {
      sort ( start , right ) ;
      sort ( right + 1 , end ) ;
    } else {
      // If array[right] is equal to the reference, sort both sides excluding the pivot.
      sort ( start , right - 1 ) ;
      sort ( right + 1 , end ) ;
    }

  } ) ( 0 , array . length - 1 ) ; // Initial call to sort the entire array.


  // Return the sorted array.
  return array ;
}




// This function computes the greatest common divisor (GCD) for an array of numbers.
const gcdArr = function ( arr ) {

  // Start with the GCD of the first two elements.
  let gcdres = gcd ( arr [ 0 ] , arr [ 1 ] )

  // Iterate through the rest of the array, updating the GCD.
  for ( let i = 2 ; i < arr . length ; i ++ ) {
    gcdres = gcd ( gcdres , arr [ i ] )
  }

  // Return the final GCD.
  return gcdres
}


// An iterative implementation of the Euclidean algorithm for GCD calculation.
// This version has a fixed loop for a certain number of iterations, then falls back to recursive.
function gcd_impl ( n , m ) {
  for ( let i = 0 ; i < 10 ; ++ i ) {
    let t = n - m ;
    let q = m > t ;
    n = q ? m : t ;
    m = q ? t : m ;
    if ( m == 0 ) { return n ; }
  }
  // Fallback to recursive Euclidean algorithm if not converged within 10 iterations.
  return gcd_impl ( m , n % m ) ;
}


// Wrapper function for GCD to ensure n is always greater than or equal to m for gcd_impl.
function gcd ( n , m ) {
  return n > m ? gcd_impl ( n , m ) : gcd_impl ( m , n ) ;
}




// The main function that processes input and produces output.
const Main = ( p ) => {

  // Split the input string by newlines to get an array of lines.
  p = p . split ( "\n" ) ;

  // Parse the first number from the first line.
  let N = parseInt ( p [ 0 ] . split ( " " ) [ 0 ] ) ;

  // Parse the second line as an array of numbers.
  let a = p [ 1 ] . split ( " " ) . map ( Number ) ;


  // Create an array of objects, each containing its original index 'i' and value 'A'.
  let A = new Array ;
  for ( let i = 0 ; i < N ; i ++ ) {
    A . push ( { i : i , A : a [ i ] } ) ;
  }


  // Initialize variables for the processing logic.
  let f = 1 , b = N , sum = 0 ;

  // Sort the array 'A' using the custom quicksort.
  A = qsort ( A ) ;


  // Loop through the sorted array in reverse order.
  for ( let i = N - 1 ; i >= 0 ; i -- ) {

    // Logic to calculate sum based on positions relative to 'f' and 'b'.
    if ( N - A [ i ] . i < A [ i ] . i + 1 ) {
      sum += A [ i ] . A * ( A [ i ] . i - f + 1 ) ;
      f ++ ;
    } else if ( N - A [ i ] . i > A [ i ] . i + 1 ) {
      sum += A [ i ] . A * ( b - A [ i ] . i - 1 ) ;
      b -- ;
    } else {
      // Special handling when N - A[i].i == A[i].i + 1.
      // This part depends on the next element's properties.
      if ( N - A [ i + 1 ] . i < A [ i + 1 ] . i + 1 ) {
        sum += A [ i ] . A * ( b - A [ i ] . i - 1 ) ;
        b -- ;
      } else if ( N - A [ i + 1 ] . i > A [ i + 1 ] . i + 1 ) {
        sum += A [ i ] . A * ( A [ i ] . i - f + 1 ) ;
        f ++ ;
      }
    }
  }


  // Output the final calculated sum to the console.
  console . log ( sum ) ;
}

// Standard input/output handling. Do not modify this section.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;