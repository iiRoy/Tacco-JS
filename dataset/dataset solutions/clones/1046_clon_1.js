/*
 * This JavaScript program processes input from standard input to solve
 * a resource allocation problem. It aims to find the minimum possible
 * maximum weight that can be assigned to any single unit, given a
 * fixed number of units ('k') and a list of item weights ('wi').
 *
 * The core logic involves a binary search approach on the possible
 * range of maximum weights, utilizing a helper function to check
 * the feasibility of a given maximum weight.
 */

// Import the Node.js 'fs' (file system) module to enable reading from files.
// Specifically, it reads the entire content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string.
const input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// --- Input Parsing Section ---

// 1. Clean the raw input string by removing any leading or trailing
//    whitespace characters using `trim()`.
// 2. Split the cleaned string into an array of individual lines using
//    the newline character `\n` as the delimiter.
const inputs = input . trim() . split ( '\n' ) ;


// Extract problem parameters from the first line of input.
// The first line is expected to contain two space-separated integers:
// 'n' (the total number of items, though not directly used in the main logic after this parse)
// and 'k' (the number of available allocation units/trucks).
// `inputs[0]` accesses the first line, `split(' ')` divides it by space,
// and `map(Number)` converts the resulting string parts into actual numbers.
const   [ n , k ]   =   inputs[ 0 ] . split ( ' ' ) . map ( Number ) ;


// Extract item weights from the subsequent lines of input.
// `inputs.slice(1)` creates a new array containing all lines from the second one onwards.
// `map(Number)` then converts each of these line strings into numerical weight values.
const   wi   =   inputs . slice ( 1 ) . map ( Number ) ;


// --- Helper Function: isAllocatable ---

/**
 * Checks if it's possible to allocate all items from `list` into
 * `units` such that no single unit's total weight exceeds `maxWeight`.
 * This function is crucial for the binary search algorithm.
 *
 * @param { number[] } list      - An array containing the weights of all items.
 * @param { number }   maxWeight - The proposed maximum weight capacity for a single unit.
 * @param { number }   units     - The total number of available units (e.g., trucks, containers).
 * @returns { boolean } Returns `true` if all items can be allocated under the given constraints,
 *                      `false` otherwise.
 */
const isAllocatable = ( list , maxWeight , units ) =>
{

  // `weight` tracks the current accumulated weight for the unit being filled.
  let weight = 0 ;

  // Iterate through each item in the provided list of weights.
  for ( let i = 0 ;   i < list . length ;   i++ )
  {
    // Edge case check: If any single item is heavier than the allowed `maxWeight`,
    // it's impossible to allocate, regardless of how many units are available.
    if ( list[ i ] > maxWeight )
    {
      return false ;
    }

    // Check if adding the current item (`list[i]`) to the current unit
    // would cause the unit's total weight to exceed `maxWeight`.
    if ( weight + list[ i ] > maxWeight )
    {
      // If it exceeds, we must use a new unit for this item.
      // Decrement the count of available units.
      // If `units` becomes 0 or less, it means we've run out of units
      // before allocating all items, so allocation is impossible.
      if ( --units <= 0 )
      {
        return false ;
      }

      // Start the new unit with the current item's weight.
      weight = list[ i ] ;
    }
    else
    {
      // If the current item fits into the current unit, add its weight.
      weight += list[ i ] ;
    }
  }

  // If the loop completes, it means all items have been successfully
  // allocated without exceeding `maxWeight` for any unit and without
  // running out of units.
  return true ;
} ;


// --- Binary Search Setup ---

// Calculate the maximum possible total weight. This sum represents
// the absolute upper bound for any single unit's capacity (if all items
// were in one unit). It's also used to define the search space.
// `wi.reduce((a, b) => a + b)` sums all item weights.
// `Array(...) . keys()` creates an iterable of numbers from 0 up to
// (but not including) the total sum, representing all possible candidate
// values for `maxWeight`.
const pList = [ ... Array( wi . reduce ( ( a , b ) => a + b ) ) . keys () ] ;


// Initialize the lower bound (`l`) and upper bound (`r`) for the binary search.
// `l` starts at 0, representing the smallest possible maximum weight (though typically items have positive weight).
let l = 0 ;

// `r` starts at the length of `pList`, which is effectively the total sum of all weights.
// This represents the largest possible maximum weight (where all items fit in one unit).
let r = pList . length ;


// --- Binary Search Algorithm ---

// The binary search loop continues as long as there is a range of at least two
// potential maximum weights between `l` and `r`.
while (   l + 1 < r   )
{
  // Calculate the middle index of the current search range.
  // `Math.floor` ensures we get an integer index.
  const   index   =   Math . floor ( ( l + r ) / 2 ) ;

  // Retrieve the candidate maximum weight from `pList` using the calculated `index`.
  const candidateMaxWeight = pList[ index ] ;

  // Call the helper function `isAllocatable` to check if all items can be
  // allocated with the current `candidateMaxWeight` using `k` units.
  if (   ! isAllocatable ( wi , candidateMaxWeight , k )   )
  {
    // If `isAllocatable` returns `false`, it means `candidateMaxWeight` is too small.
    // We need a larger maximum weight, so we update the lower bound `l` to `index`.
    l = index ;
  }
  else
  {
    // If `isAllocatable` returns `true`, it means `candidateMaxWeight` (or possibly
    // an even smaller weight) is feasible. We update the upper bound `r` to `index`
    // to try and find the absolute minimum feasible maximum weight.
    r = index ;
  }
}


// --- Result Output ---

// After the binary search loop terminates, `r` will point to the index
// in `pList` that corresponds to the smallest `maxWeight` for which
// `isAllocatable` returned `true`. This is our optimal answer.
const p = pList[ r ] ;

// Print the final result to standard output.
console . log ( p ) ;