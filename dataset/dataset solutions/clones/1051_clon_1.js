/*
 * This file contains a JavaScript solution for a dynamic programming problem.
 * It reads input from standard input, processes it, and then applies
 * memoization to efficiently solve the subset sum-like problem.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Purpose: Demonstrate Type I code cloning by altering only whitespace and comments.
 */


// Utilize Node.js 'fs' module to read synchronous file input.
const input = require  ( 'fs' )  .  readFileSync  ( '/dev/stdin'  ,  'utf8'  )  ;



// The input string is first trimmed to remove any leading/trailing whitespace,
// then split into an array of lines based on the newline character.
const list = input  .  trim  ( )  .  split  ( '\n'  )  ;


// The first line contains 'n', the number of elements in array A.
const n = Number  ( list  [  0  ]  )  ;


// The second line contains space-separated elements of array A.
// It's trimmed and split by space.
const A = list  [  1  ]  .  trim  ( )  .  split  ( ' '  )  ;


// The third line contains 'q', the number of queries.
const q = Number  ( list  [  2  ]  )  ;


// The fourth line contains space-separated target sums for each query.
// It's trimmed and split by space.
const mi = list  [  3  ]  .  trim  ( )  .  split  ( ' '  )  ;




/*
 * KeyMap Class:
 * This utility class helps in creating a nested object structure
 * that can serve as a composite key for a Map, especially when dealing
 * with multiple arguments as keys for memoization.
 *
 * Each argument in 'get' method creates a new level in the nested map
 * if it doesn't already exist.
 */
class KeyMap
{

  constructor ( )
  {
    // Initialize the root map for storing keys.
    this  .  map  =  {  }  ;
  }


  /**
   * Retrieves or creates a nested object path based on the provided arguments.
   * This effectively allows using multiple values as a single composite key.
   * @param {Array<any>} args - The arguments that form the composite key.
   * @returns {Object} The innermost object corresponding to the composite key.
   */
  get ( ...args )
  {
    let map = this  .  map  ; // Start from the root of the key map.

    args  .  forEach  (  arg  =>
    {
      // If the current argument's path doesn't exist, create an empty object for it.
      map  [  arg  ]  =  map  [  arg  ]  ||  {  }  ;

      // Move deeper into the nested map for the next argument.
      map  =  map  [  arg  ]  ;
    }  )  ;

    // Return the final, deepest map object corresponding to the full key path.
    return map  ;
  }

}




// Initialize a new Map object to store memoized results of the 'memo' function.
// This will store boolean values (true/false) indicating if a sum 'm' can be formed
// using elements from index 'i' onwards.
const dp = new Map ( )  ;


// Create an instance of the KeyMap class.
// This will be used to generate unique keys for the 'dp' Map based on (i, m) pairs.
const keyMap = new KeyMap ( )  ;


/*
 * memo function:
 * This is a recursive function with memoization to solve the subset sum problem.
 * It checks if a sum 'm' can be formed using a subset of elements from array A,
 * starting from index 'i'.
 *
 * @param {number} i - The current index in array A.
 * @param {number} m - The target sum we are trying to achieve.
 * @returns {boolean} - True if 'm' can be formed, false otherwise.
 */
const memo = ( i  ,  m )  =>
{

  // Check if the result for the current (i, m) pair is already memoized.
  // If it is, return the stored result directly to avoid redundant computations.
  if  (  dp  .  has  (  keyMap  .  get  (  i  ,  m  )  )  )
  {
    return  dp  .  get  (  keyMap  .  get  (  i  ,  m  )  )  ;
  }


  // Base case 1: If we have exhausted all elements (i.e., 'i' reaches 'n')
  // or if the target sum 'm' has become zero or negative.
  if  (  i  ===  n  ||  m  <=  0  )
  {
    // If 'm' is exactly zero, it means we found a subset that sums up to the target.
    // Otherwise, if 'm' is negative or we ran out of elements with 'm' > 0, it's not possible.
    return  m  ===  0  ;
  }


  // Recursive step: Consider two possibilities for the element A[i].

  // Possibility 1: DO NOT include A[i] in the subset.
  // Move to the next element (i + 1) while keeping the target sum 'm' unchanged.
  const nI = i  +  1  ;


  // Possibility 2: INCLUDE A[i] in the subset.
  // Move to the next element (i + 1) and reduce the target sum by A[i].
  // Note: A[i] is a string, so convert it to a number before subtraction.
  const nM = m  -  Number  (  A  [  i  ]  )  ;


  // Recursively call memo for both possibilities and store their results.
  // This is crucial for dynamic programming: compute subproblems once.

  // Store the result of NOT including A[i].
  dp  .  set  (  keyMap  .  get  (  nI  ,  m  )  ,  memo  (  nI  ,  m  )  )  ;

  // Store the result of INCLUDING A[i].
  dp  .  set  (  keyMap  .  get  (  nI  ,  nM  )  ,  memo  (  nI  ,  nM  )  )  ;


  // The overall result for (i, m) is true if *either* not including A[i]
  // leads to a solution *OR* including A[i] leads to a solution.
  return  dp  .  get  (  keyMap  .  get  (  nI  ,  m  )  )  ||  dp  .  get  (  keyMap  .  get  (  nI  ,  nM  )  )  ;

}


// Loop through each query 'q' to find if the target sum 'mi[i]' can be formed.
for  (  let  i  =  0  ;  i  <  q  ;  i  ++  )
{
  // For each query, call the 'memo' function starting from index 0 with the target sum.
  // Convert the result (boolean) to 'yes' or 'no' string and print it to console.
  console  .  log  (  memo  (  0  ,  Number  (  mi  [  i  ]  )  )  ?  'yes'  :  'no'  )  ;
}


// Optional: Uncomment the line below to inspect the final memoization table 'dp'.
// console.log(dp);