/*
 * This script processes input data from standard input.
 * It's structured to handle multiple test cases, each starting with a number 'n'.
 * The core logic involves transforming strings and finding a common prefix length.
 */

// We first require the built-in 'fs' module for file system operations.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is then trimmed of any leading/trailing whitespace
// and split into an array of lines based on the newline character.
var arr = input.trim().split("\n");


// This is the main loop that continuously processes test cases
// until a specific termination condition is met.
while (true) {

  // The first element of the array 'arr' is shifted off and
  // converted to a number 'n'. The '- 0' is a common JS trick for type coercion.
  var n = arr.shift() - 0;

  // If 'n' is exactly 0, it signifies the end of the input stream,
  // so we break out of the infinite loop.
  if (n == 0) {
    break;
  }


  // We extract 'n' lines from the beginning of the 'arr' array,
  // storing them in a new array named 'Arr'.
  var Arr = arr.splice(0, n);

  // An empty object 'obj' is initialized. This will be used to store
  // unique processed strings later, acting like a set.
  var obj = {};

  // 'max' is initialized to 0. It will keep track of the maximum length
  // of any processed string encountered.
  var max = 0;


  // We iterate over each string 'v' within the 'Arr' array.
  Arr.forEach(function (v) {

    // 'str' is a local reference to the current string 'v'.
    var str = v;

    // 's' will accumulate characters based on a specific rule.
    // It starts with the first character of 'str'.
    var s = str[0];

    // 'flag' is a boolean variable, initially false, used to track
    // if the *previous* character processed was a vowel.
    var flag = false;

    // This loop iterates through each character of the current string 'str'.
    for (var i = 0; i < str.length; i++) {

      // If 'flag' is true (meaning the character *before* the current one was a vowel),
      // the current character 'str[i]' is appended to 's'.
      if (flag) {
        s += str[i];
      }

      // The 'flag' is then updated based on whether the *current* character 'str[i]'
      // is a vowel (a, i, u, e, o).
      // The ternary operator explicitly sets it to true or false.
      flag = (/[aiueo]/.test(str[i])) ? true : false;
    }

    // The final processed string 's' is added as a key to the 'obj' object.
    // The value 'true' is arbitrary; its presence as a key is what matters.
    obj[s] = true;

    // 'max' is updated to be the greater of its current value or the length of 's'.
    max = Math.max(max, s.length);

  }); // End of the forEach loop.


  // This loop attempts to find the smallest 'i' (length)
  // such that all processed strings have unique prefixes of that length 'i'.
  for (var i = 1; i <= max; i++) {

    // A new empty object 'Obj' is created for each iteration of 'i'.
    // This will store the unique prefixes of length 'i'.
    var Obj = {};

    // We iterate over the keys (the processed strings 's') in the 'obj' object.
    for (var key in obj) {

      // For each 'key', we extract a substring from its beginning up to length 'i'.
      // This substring (prefix) is then added as a key to 'Obj'.
      Obj[key.slice(0, i)] = true;
    }

    // After processing all keys for the current 'i', we check
    // if the number of unique prefixes in 'Obj' is equal to 'n'.
    // 'n' represents the original count of strings in the test case.
    if (Object.keys(Obj).length == n) {

      // If they are equal, it means we found the smallest 'i' where
      // all 'n' original strings (after processing) have unique prefixes of length 'i'.
      // We print 'i' to the console.
      console.log(i);

      // And then we break out of this inner 'for' loop, moving to the next test case.
      break;
    }

    // If the loop finishes without finding such an 'i' (i.e., 'i' reaches 'max'),
    // it implies no such common prefix length exists.
    if (i == max) {
      // In this case, we print -1 to indicate no solution was found.
      console.log(-1);
    }
  } // End of the 'for i' loop.

} // End of the main 'while (true)' loop.