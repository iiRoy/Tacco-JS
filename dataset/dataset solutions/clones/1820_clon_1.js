/*
 * This JavaScript file processes a single command-line argument,
 * which is expected to be a string representation of a large integer.
 * It then calculates the number of distinct prime factors of N,
 * considering their multiplicities.
 * For example, if N = 12 (2*2*3), the prime factors are 2 and 3.
 * The method counts the unique prime bases.
 * However, the specific logic implemented seems to be counting the
 * number of distinct prime factors, where each factor is considered
 * only once, even if it appears multiple times (e.g., 2 for 12),
 * and then if no factors are found, it defaults to 1.
 *
 * Let's analyze the algorithm:
 * It iterates through potential prime factors 'p' starting from 2.
 * It uses a list 'pn' to store previously found prime numbers.
 * The outer loop continues as long as p*p <= N or p === N (for the case where N is a prime itself).
 *
 * Inside the outer loop:
 *   - It checks if 'p' is divisible by any already found prime 'j' (from 'pn').
 *     If 'p' is divisible by 'j', then 'p' is not prime, so it skips to the next 'p' using 'continue OUTER'.
 *   - If 'p' is not divisible by any 'j' (meaning 'p' is prime), it adds 'p' to the 'pn' list.
 *   - Then, it enters an inner loop to check for powers of this prime 'p' that divide N.
 *     It iterates 'z' as p, p*p, p*p*p, etc., as long as z <= N.
 *     If N is divisible by 'z', it increments 'count' and divides N by 'z'.
 *     This effectively removes all occurrences of 'p' from N and counts 'p' as a factor once.
 *
 * Finally, if 'count' is 0 (meaning N was 1 from the start, or N became 1 and no prime factors were found in the loop,
 * which implies the original N was 1 or a prime number greater than 1 that couldn't be factored by the loop's condition),
 * it sets 'count' to 1. This handles the case where N itself is a prime or 1.
 * The result is then printed to the console.
 */

function   main(  args   )
{


  let N  =  BigInt( args ) ; // Convert input string to BigInt.

  // If N is 1, there are no prime factors. The problem implies 0 distinct prime factors for 1.
  if  (  N  ===  1n  )
  {
    return  console.log( '0' ) ;
  }

  // Initialize count of distinct prime factors.
  let  count  =  0 ;

  // Array to store prime numbers found so far.
  const  pn  =  [ ] ;

  // Outer loop: Iterate through potential prime factors 'p'.
  // The loop continues as long as p*p <= N (standard prime factorization limit)
  // or p === N (to handle the case where N itself is a prime number and 'p' reaches N).
  OUTER: for  (  let  p  =  2n  ;  p  *  p  <=  N  ||  p  ===  N  ;  p++  )
  {
    // Inner loop: Check if 'p' is divisible by any previously found prime 'j'.
    // This optimization helps in skipping composite numbers for 'p'.
    for  (  let  i  =  0  ,  j  ;  j  =  pn[ i ]  ;  i++  )
    {
      // If j*j > N, then any subsequent prime 'j' would also be too large
      // to be a factor of 'p' (which is <= N or sqrt(N)).
      // More importantly, if j*j > N, then 'j' cannot be a factor of the *current* N,
      // and thus no further primes in 'pn' can divide 'p' if 'p' is also less than or equal to N.
      // This break is a bit aggressive for the inner loop, but it works
      // because if j*j > N, then j > sqrt(N). If p was a multiple of such j,
      // p would be larger than sqrt(N) * sqrt(N) = N, which is not possible
      // since p <= N.
      if  (  j  *  j  >  N  )
      {
        break ;
      }
	  else  if  (  p  %  j  ===  0n  ) // If 'p' is divisible by 'j', then 'p' is not prime.
      {
        continue  OUTER ; // Skip to the next 'p' in the outer loop.
      }
    }

    // If 'p' survived the inner loop, it means 'p' is a prime number.
    pn.push( p ) ;

    // Inner loop: Find all powers of the current prime 'p' that divide N.
    // 'z' will be p, p^2, p^3, etc.
    for  (  let  z  =  p  ;  z  <=  N  ;  z  *=  p  )
    {
      // If N is divisible by 'z', it means 'p' is a factor.
      if  (  N  %  z  ===  0n  )
      {
        count ++ ; // Increment the count of distinct prime factors.
        N  /=  z ; // Divide N by 'z' to remove all occurrences of 'p' from N.
      }
      else // If N is not divisible by 'z', it means we've exhausted powers of 'p'.
      {
        break ; // Exit this inner loop and move to the next potential prime 'p'.
      }
    }
  }

  // Final check: If no prime factors were found (e.g., if N was 1 initially, or N became 1,
  // or if N was a prime number greater than 1 that couldn't be fully factored by the loop's condition).
  // The problem implies that a single prime number (e.g., 7) should count as 1 distinct prime factor.
  // The loop condition p*p <= N || p === N handles single primes.
  // This 'if' effectively ensures that if N was a prime (e.g., 7), and the loop finished, count would be 1.
  // If count is 0, it means the original N was 1, or perhaps a very large prime that the loop didn't fully process
  // (though the p===N condition should handle this). This seems to cover the N=1 case if it wasn't caught earlier.
  if  (  count  ===  0  )
  {
    count  =  1 ; // Treat N=1 or an unfactored prime as having 1 "distinct" factor for this specific problem context.
  }

  // Print the final count of distinct prime factors.
  console.log( count.toString( ) ) ;
}

// Read input from /dev/stdin, convert it to a string, and pass it to the main function.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;