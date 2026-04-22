/*
 *  This module provides two primary functions: quick_sort and calc_cost.
 *  It was originally developed in OCaml and has been translated into JavaScript.
 *  The code aims to maintain a functional style where appropriate,
 *  while adapting OCaml-specific constructs to JavaScript equivalents.
 */


//  Function: quick_sort
//  -----------------------------------------------------------------------------
//  Sorts an array `a` of size `n` in place using the quicksort algorithm.
//  The sorting order is determined by the provided comparison function `cmp`.
//  `cmp` should return a negative value if `x < y`, zero if `x == y`,
//  and a positive value if `x > y`.
function quick_sort(a, n, cmp) {


  //  Nested helper function: swap
  //  -------------------------------------------------------------------------
  //  Exchanges the elements at two specified indices `i` and `j` within the array `a`.
  const swap = (i, j) => {
    let tmp = a[i]; // Temporarily store the value at index `i`.
    a[i] = a[j];    // Assign the value from index `j` to index `i`.
    a[j] = tmp;     // Assign the temporarily stored value to index `j`.
  };


  //  Nested helper function: partition
  //  -------------------------------------------------------------------------
  //  Rearranges the subarray `a[p...r]` such that all elements less than
  //  or equal to the pivot (which is `a[r]`) come before it, and all
  //  elements greater than the pivot come after it.
  //  Returns the final index of the pivot element after partitioning.
  const partition = (p, r) => {
    //  `i` acts as a mutable reference, tracking the boundary between
    //  elements smaller than the pivot and elements yet to be processed.
    let i = { value: p }; //  OCaml's `ref p` is simulated with an object wrapper.

    //  Iterate through the subarray from `p` up to (but not including) `r`.
    for (let j = p; j <= r - 1; j++) {
      //  If the current element `a[j]` is less than or equal to the pivot `a[r]`,
      //  swap it with the element at `i.value` and then increment `i.value`.
      if (cmp(a[j], a[r]) <= 0) {
        swap(i.value, j); // Perform the swap operation.
        i.value++;        // Increment the mutable index `i`.
      }
    }

    //  After the loop, place the pivot element (`a[r]`) at its correct sorted position
    //  by swapping it with the element currently at `i.value`.
    swap(i.value, r);

    //  Return the final index of the pivot element.
    return i.value;
  };


  //  Recursive helper function: doit
  //  -------------------------------------------------------------------------
  //  The main recursive function that implements the quicksort logic.
  //  It sorts the subarray `a[p...r]`.
  const doit = (p, r) => {
    //  Base case for recursion: if the subarray has one or zero elements,
    //  it is already sorted, so no further action is needed.
    if (p >= r) {
      return;
    }

    //  Partition the current subarray and obtain `q`, the final index of the pivot.
    let q = partition(p, r);

    //  Recursively sort the left partition (elements before the pivot).
    doit(p, q - 1);

    //  Recursively sort the right partition (elements after the pivot).
    doit(q + 1, r);
  };


  //  Initiate the quicksort process on the entire array, from index 0 to `n-1`.
  doit(0, n - 1);
}


//  Function: calc_cost
//  -----------------------------------------------------------------------------
//  Calculates a specific cost based on the input array `a` and its size `n`.
//  This function involves sorting a copy of the array, cycle detection,
//  and cost aggregation based on cycle properties.
function calc_cost(a, n) {

  //  Create a shallow copy of the input array `a`.
  //  This ensures that the original array `a` remains unmodified.
  let b = [...a]; // Equivalent to OCaml's `Array.copy a`.


  //  Sort the copied array `b` using the `quick_sort` function.
  //  A standard numerical comparison function `(x, y) => x - y` is used.
  quick_sort(b, n, (x, y) => x - y);


  //  Determine the required size for array `t`.
  //  It needs to be large enough to hold indices for values up to `b[n-1]` (the maximum value in `b`).
  let t_size = b[n - 1] + 1;

  //  Initialize array `t` with `t_size` elements, all set to `0`.
  //  `t` will act as a mapping from a value to its sorted index in `b`.
  let t = Array(t_size).fill(0); // Equivalent to OCaml's `Array.make (b.(n-1) + 1) 0`.

  //  Populate array `t`: for each element `e` at index `i` in the sorted array `b`,
  //  store `i` at `t[e]`. This maps each unique value to its first occurrence's index in `b`.
  b.forEach((e, i) => {
    t[e] = i;
  });


  //  Initialize a boolean array `p` of size `n`, with all elements set to `false`.
  //  `p` is used to keep track of which indices in `a` have already been visited
  //  as part of a cycle during the cost calculation process.
  let p = Array(n).fill(false); // Equivalent to OCaml's `Array.make n false`.


  //  Recursive helper function: cycle_recursive
  //  -------------------------------------------------------------------------
  //  Traces a cycle starting from a given index `i` in array `a`.
  //  `acc` is an accumulator (a list/array) that stores the elements encountered in the cycle.
  const cycle_recursive = (i, acc) => {
    p[i] = true; // Mark the current index `i` as visited.

    //  Find the next index `j` in the cycle: it's the sorted position of the value `a[i]`.
    let j = t[a[i]];

    //  If the next index `j` has already been visited, the cycle is complete.
    if (p[j]) {
      return [a[i], ...acc]; // Prepend `a[i]` to the accumulated list and return.
    } else {
      //  If `j` has not been visited, continue tracing the cycle recursively.
      return cycle_recursive(j, [a[i], ...acc]); // Prepend `a[i]` and recurse with `j`.
    }
  };


  //  Wrapper function: cycle_wrapper
  //  -------------------------------------------------------------------------
  //  Initiates a cycle trace from index `i` with an empty accumulator.
  const cycle_wrapper = (i) => cycle_recursive(i, []);


  //  Recursive function: doit (main cost calculation loop)
  //  -------------------------------------------------------------------------
  //  Iterates through the original array `a` to identify cycles and compute their costs.
  //  `i` is the current index being considered in `a`.
  //  `acc` accumulates the total cost calculated so far.
  const doit = (i, acc) => {
    //  Base case: If all elements (up to `n`) have been processed, return the total cost.
    if (i === n) {
      return acc;
    }
    //  If the current index `i` has already been visited (i.e., it's part of a
    //  cycle that was processed previously), skip it and move to the next index.
    else if (p[i]) {
      return doit(i + 1, acc);
    }
    //  If `i` has not been visited, it signifies the start of a new cycle.
    else {
      let ws = cycle_wrapper(i); // Discover all elements within this new cycle.
      let m = ws.length;         // `m` is the number of elements in the cycle.
      let s = ws.reduce((sum, val) => sum + val, 0); // `s` is the sum of all elements in the cycle.
      let z = Math.min(...ws);   // `z` is the minimum element value found within this cycle.

      //  Calculate the cost for the current cycle using two potential strategies
      //  and choose the minimum of the two. This cost is then added to the total accumulator.
      //  Strategy 1: `s + (m - 2) * z` (using the cycle's minimum element `z`)
      //  Strategy 2: `s + z + (m + 1) * b[0]` (using the overall minimum element `b[0]`)
      return doit(i + 1, acc + (Math.min(s + (m - 2) * z, s + z + (m + 1) * b[0])));
    }
  };


  //  Begin the cost calculation process, starting from index 0 with an initial accumulated cost of 0.
  return doit(0, 0);
}


//  -----------------------------------------------------------------------------
//  Utility functions to emulate OCaml's standard input/output.
//  These functions provide placeholders for reading integers and printing results.
//  In a real execution environment, these might need to be configured
//  to interact with actual standard input/output streams.
//  -----------------------------------------------------------------------------

//  Function: read_int
//  -----------------------------------------------------------------------------
//  A placeholder function designed to mimic OCaml's `read_int()`.
//  It is expected to read a single integer value from the standard input.
//  For actual execution, replace the `return 0;` with appropriate input logic
//  (e.g., `parseInt(readline())` in Node.js, or `parseInt(prompt('...'))` in a browser).
function read_int() {
  return 0; // Default placeholder value; requires implementation for actual input.
}


//  Function: scanf_d_e
//  -----------------------------------------------------------------------------
//  Mimics OCaml's `Scanf.scanf "%d " (fun e -> e)`.
//  This function effectively reads a single integer from input,
//  similar to `read_int()`, and returns it.
function scanf_d_e() {
    return read_int();
}


//  Function: printf_d_newline
//  -----------------------------------------------------------------------------
//  Mimics OCaml's `Printf.printf "%d\n"`.
//  Prints a given integer value to the console, followed by a newline character.
function printf_d_newline(val) {
  console.log(val);
}


//  -----------------------------------------------------------------------------
//  Main Execution Block (Immediately Invoked Function Expression - IIFE)
//  -----------------------------------------------------------------------------
//  This block serves as the entry point for the program,
//  analogous to OCaml's top-level `let () = ...` construct.
(function() {

  //  To enable testing with predefined inputs without requiring interactive input,
  //  one could uncomment and configure a mock input queue like the example below:
  /*
  let inputQueue = [5, 10, 20, 30, 40, 50]; // Example input values: n=5, then 5 array elements.
  let inputIndex = 0;
  read_int = () => inputQueue[inputIndex++]; // Override read_int to use the mock queue.
  scanf_d_e = () => inputQueue[inputIndex++]; // Override scanf_d_e to use the mock queue.
  */

  //  First, read the integer `n`, which specifies the number of elements in array `a`.
  let n = read_int();

  //  Initialize array `a` by reading `n` integer values from the input.
  //  `Array.from({ length: n }, ...)` creates an array of size `n`
  //  and populates each element by calling `scanf_d_e()`.
  let a = Array.from({ length: n }, () => scanf_d_e());

  //  Calculate the cost using the `calc_cost` function with array `a` and its size `n`.
  //  Then, print the resulting cost to the console, followed by a newline.
  printf_d_newline(calc_cost(a, n));

})();