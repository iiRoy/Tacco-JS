/*
 * This JavaScript file processes a series of name lists
 * obtained from standard input.
 *
 * The primary goal is to find the longest common prefix
 * length among a sorted list of "processed" names,
 * indicating a certain level of similarity.
 */

// Import the 'fs' (file system) module
var input = require("fs") . readFileSync(
  "/dev/stdin" ,
  "utf8"
) ; // Read all data from standard input as a UTF-8 string

// Split the entire input string by newline characters
// to get an array of lines.
input = input . split("\n");


// Initialize an index to keep track of the current line
// being processed from the input array.
var index = 0;

// Main processing loop: continues indefinitely until a specific
// termination condition is met (n == 0).
while (
  true
)
{
    /*
     * Read the number of names for the current test case.
     * The unary plus operator (+) converts the string to a number.
     * The 'index++' increments the index after use.
     */
    var n = +input[
      index++
    ];

    // If 'n' is 0, it signifies the end of input, so break the loop.
    if (
      n == 0
    )
    {
        break;
    }

    // Initialize an empty array to store the names for the current test case.
    var s = [];

    // Loop 'n' times to read each name from the input.
    for (
      var i = 0;
      i < n;
      i++
    )
    {
        // Add the current name (line) from input to the 's' array.
        // Increment 'index' after accessing the element.
        s.push(
          input[index++]
        );
    }

    // Process each name in the 's' array:
    // 1. Map: Transform each name according to specific rules.
    // 2. Sort: Sort the transformed names alphabetically.
    s = s.map(
      function (
        name
      )
      {
        var result = ""; // Stores the processed name.
        var flg = true; // Flag to indicate if the next character should be added.

        // Iterate through each character of the original name.
        for (
          var _i = 0,
          name_1 = name;
          _i < name_1.length;
          _i++
        )
        {
          var c = name_1[_i]; // Current character.

          // If 'flg' is true, append the character to 'result'
          // and reset 'flg' to false. This effectively adds the
          // first character after a vowel (or the very first char).
          if (
            flg
          )
          {
            result += c;
            flg = false;
          }

          // Check if the current character is a vowel (a, i, u, e, o).
          // If it is, set 'flg' to true, meaning the next character
          // encountered (if any) will be added to 'result'.
          if (
            /
              [aiueo]
            /.test(
              c
            )
          )
          {
            flg = true;
          }
        }

        // Return the processed name.
        return result;
      }
    )
    .sort(); // Sort the array of processed names alphabetically.


    // Define a helper function to count the length of the common prefix
    // between two strings.
    var countDuplicate = function (s1, s2) {
        // Determine the minimum length between the two strings.
        var l = Math.min(
          s1.length,
          s2.length
        );

        // Iterate up to the minimum length.
        for (
          var i = 0;
          i < l;
          i++
        )
        {
            // If characters at the current position differ,
            // return the current index, which is the length
            // of the common prefix.
            if (
              s1[i] != s2[i]
            )
            {
                return i;
            }
        }

        // If one string is a prefix of the other and they have equal length,
        // it means they are identical. Return -1 to signify this.
        if (
          s1.length == s2.length
        )
        {
          return -1;
        }

        // If one string is a prefix of the other (and not identical),
        // return the length of the shorter string (which is 'l'),
        // as that's the common prefix length.
        return l;
    };


    // Initialize 'result' to 0. This variable will store the maximum
    // common prefix length found among adjacent sorted names.
    var result = 0;

    // Iterate through the sorted array of processed names.
    // Start from the second element (index 1) to compare with the previous one.
    for (
      var i = 0;
      i < n;
      i++
    )
    {
        // Skip the first element as there's no preceding element to compare with.
        if (
          i == 0
        )
        {
          continue;
        }

        // Calculate the common prefix length between the current name
        // and the one immediately before it in the sorted array.
        var c = countDuplicate(
          s[i - 1],
          s[i]
        );

        // If 'c' is -1, it means two adjacent names are identical.
        // In this specific problem context, this leads to a special
        // result of -2, and we break early.
        if (
          c == -1
        )
        {
            result = -2;
            break;
        }

        // If the current common prefix length 'c' is greater than
        // the maximum 'result' found so far, update 'result'.
        if (
          c > result
        )
        {
            result = c;
        }
    }

    // Output the final result for the current test case.
    // The problem statement requires adding 1 to the calculated result.
    console.log(
      result + 1
    );
}