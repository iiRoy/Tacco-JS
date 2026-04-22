/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are identical to the original.
 * Only whitespace and comments have been altered.
 * This ensures logical and structural equivalence while appearing visually different.
 */

// Function: Main - orchestrates the primary logic.
function   Main (  s   )
{


  // Initialize an array to store processing results.
  var results = [];

  // Invoke the first subroutine with initial parameters.
  Sub1(s, 0, 1, results);

  // The original code had a commented-out console.log for results.
  // console.log(results); // This line was commented in the original source.

  // Output the final count of elements in the results array.
  console.log('%d', results.length);

}


/**
 * Sub1 function: Processes the input string 's' based on current index 'i'
 *                and length 'iLen', updating 'results'.
 * @param {string} s - The input string.
 * @param {number} i - Current starting index in 's'.
 * @param {number} iLen - Length of the substring to consider.
 * @param {Array<string>} results - Array to accumulate processed parts.
 * @returns {void}
 */
function Sub1(s, i, iLen, results) {

  // Original comment: console.log("Sub1: ", s, i, iLen, results);
  // Debugging line, removed for clarity in this version.

  // Base case: If current index exceeds string length, stop.
  if (i > s.length) {
    return;
  }

  // Extract a substring.
  var Sj = s.substr(i, iLen);

  // If the extracted substring is empty, return.
  if (Sj === '') {
    return;
  }


  // Call SubRepeat1 to handle repeating characters.
  SubRepeat1(s, i, results);


  // Update 'i' based on the total length of joined results.
  // This effectively advances the processing point in 's'.
  i = results.join("").length;


  // If 'i' has reached or exceeded the string length, we're done.
  if (i >= s.length) {
    return;
  }


  // Extract another substring for comparison.
  var Si = s.substr(i, iLen);

  // Extract the next single character for comparison.
  var Sj = s.substr(i + iLen, 1);


  // Compare Si and Sj.
  if (Si === Sj) {
    // If they are equal, extend the length and recursively call Sub1.
    return Sub1(s, i, iLen + 1, results);
  }

  else {
    // If different, push both Si and Sj to results.
    results.push(Si, Sj);

    // Then call Sub2 to continue processing from the next position.
    return Sub2(s, i + iLen + 1, 1, Sj, results);
  }

}


/*
 * Sub2 function: Handles specific substring comparisons and recursion.
 * @param {string} s - The main input string.
 * @param {number} i - Current index in 's'.
 * @param {number} iLen - Length of the substring to extract.
 * @param {string} Si - The previously matched substring for comparison.
 * @param {Array<string>} results - The array accumulating processed parts.
 */
function Sub2(s, i, iLen, Si, results) {

  // Original comment: console.log("Sub2: ", i, results);
  // Debugging line, removed here.

  // Termination condition: if 'i' goes past the string end.
  if (i > s.length) {
    return;
  }


  // Get the current substring 'Sj'.
  var Sj = s.substr(i, iLen);


  // If 'Sj' is empty, nothing more to process for this path.
  if (Sj === '') {
    return;
  }


  // Main logic: Compare 'Si' (from previous step) with current 'Sj'.
  if (Si === Sj) {
    // If they match, consider the next character.
    if (i + iLen + 1 > s.length) {
      // Special handling for end of string: swap last two elements in results.
      var Si_1 = results[results.length - 2];
      results[results.length - 2] = Si;
      results[results.length - 1] = Si_1;
      // Recursively call Sub2 with updated parameters.
      return Sub2(s, i, iLen + 1, Si_1, results);
    }
    // Normal case: continue with extended length.
    return Sub2(s, i, iLen + 1, Si, results);
  }

  else {
    // If 'Si' and 'Sj' do not match, add 'Sj' to results.
    results.push(Sj);
    // Recursively call Sub2 to continue from the new position.
    return Sub2(s, i + iLen, 1, Sj, results);
  }

}


// Function: SubRepeat1 - handles repeating character patterns.
// This function identifies and processes sequences of identical characters.
function SubRepeat1(s, i, results) {

  // Original comment: console.log("SubRepeat1: ", s, i, results);
  // Removed debugging output.

  // Get the first character at the current index.
  var tmp = s.substr(i, 1);

  // Create a regular expression to match one or more occurrences of 'tmp'.
  // Note: The original code used `tmp + '*'`, which is a regex for "zero or more".
  // Given the context of `matched[0].length`, it captures a sequence.
  var reg = new RegExp(tmp + '*');

  // Match the pattern against the rest of the string from index 'i'.
  var matched = s.substr(i).match(reg);

  // Get the length of the matched repeating sequence.
  var mLen = matched[0].length;


  // If the matched length is greater than 3, apply specific rules.
  if (mLen > 3) {
    if (mLen % 3 == 2) {
      // If remainder is 2, call SubRepeat2 with length 2.
      results = SubRepeat2(matched[0], 2, results);
    } else if (mLen % 3 == 1) {
      // If remainder is 1, call SubRepeat2 with length 1.
      results = SubRepeat2(matched[0], 1, results);
    } else {
      // If remainder is 0 (mLen % 3 == 0), also call SubRepeat2 with length 2.
      // This implies a specific handling for multiples of 3.
      results = SubRepeat2(matched[0], 2, results);
    }
  }
  // Return the updated results array.
  return results;

}


// Function: SubRepeat2 - a helper for SubRepeat1, splitting matched repeating sequences.
function SubRepeat2(matched, iLen, results) {

  // Original comment: console.log("SubRepeat2: ", matched, iLen, results);
  // Debugging output removed.

  // Extract the first part of the 'matched' string with length 'iLen'.
  var Si = matched.substr(0, iLen);

  // Add this part to the results array.
  results.push(Si);

  // Base case for recursion: if remaining 'matched' string is too short.
  if (matched.length < 3) {
    return results;
  }

  else {
    // Extract the remaining part of the 'matched' string.
    var Sj = matched.substr(iLen);

    // Recursively call SubRepeat2 with the remainder and adjusted length.
    return SubRepeat2(Sj, 3 - iLen, results);
  }

}


// Entry point: Execute the Main function with input from stdin.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );