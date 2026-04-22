/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact semantic and structural equivalence.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally identical, version.
 */
function Main(  input  ) {
  // Process the raw input string
  input = input.split(  "\n"  );

  // Parse the number of elements 'n' from the first line
  const n = parseInt(  input[0]  , 10  );

  /*
   *  Parse the list of numbers 'l' from the second line.
   *  It splits by space and converts each part to an integer.
   */
  const l = input[1] . split(  " "  ) . map(  v  =>  parseInt(  v  , 10  )  );


  let count = 0; // Initialize a counter for valid triangles

  // First loop: iterates from the first element up to n-3
  for (  let i = 0  ;  i < n  ;  i++  ) {
    // Second loop: starts from the element after 'i'
    for (  let j = i + 1  ;  j < n  ;  j++  ) {
      // Third loop: starts from the element after 'j'
      for (  let k = j + 1  ;  k < n  ;  k++  ) {

        // Check if the three selected lengths are unique
        if (  !allUnique(  l[i]  ,  l[j]  ,  l[k]  )  ) {
          continue; // If not unique, skip to the next combination
        }

        // If unique, check if they can form a triangle
        if (  isTriangle(  l[i]  ,  l[j]  ,  l[k]  )  ) {
          count++; // Increment count if it's a valid triangle
        }
      }
    }
  }

  // Output the final count of valid triangles
  console.log(  count  );
}


/*
 * Function to check if three given numbers (a, b, c) are all unique.
 * Returns true if all three are distinct, false otherwise.
 */
function allUnique(  a  ,  b  ,  c  ) {
  if (  a !== b  &&  a !== c  &&  b !== c  ) {
    return true; // All numbers are distinct
  }
  return false; // At least two numbers are identical
}


/**
 * @function isTriangle
 * @param {number} a - Length of the first side.
 * @param {number} b - Length of the second side.
 * @param {number} c - Length of the third side.
 * @returns {boolean} True if the three lengths can form a valid triangle, false otherwise.
 *
 * A triangle can be formed if the sum of the lengths of any two sides
 * is greater than the length of the third side.
 */
function isTriangle(  a  ,  b  ,  c  ) {
  if (  a + b > c  &&  b + c > a  &&  c + a > b  ) {
    return true; // The side lengths satisfy the triangle inequality
  }
  return false; // The side lengths do not form a valid triangle
}


// Entry point: Reads input from stdin and calls the Main function
Main(  require(  "fs"  ) . readFileSync(  "/dev/stdin"  ,  "utf8"  )  );