// This script reads input from stdin, processes a list of names, and calculates a specific value.
// It uses Node.js 'fs' module to read the entire input.

var   input   =   require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  ;

// The input is then split by newline characters to get individual lines.
input = input   .   split   (   "\n"   )   ;


// 'index' will be used to track the current line being read from the input array.
var   index   =   0   ;


// Main processing loop: continues until a specific termination condition is met.
while   (   true   )   { // Begin processing a new set of names.

    // Read the number of names for the current test case. The '+' converts string to number.
    let   n   =   +  input  [  index  ++  ]  ;

    // If 'n' is 0, it signifies the end of input, so break the loop.
    if   (  n  ==  0  )
        break  ; // Exit the infinite loop.

    // 's' will store the names for the current test case.
    let   s   =   [  ]  ;

    // Loop to read 'n' names from the input.
    for   (  let   i   =   0  ;   i   <   n  ;   i  ++  )   {
        s  .  push  (  input  [  index  ++  ]  )  ; // Add each name to the array.
    }


    // Process each name: extract initial character plus characters after vowels.
    // Then sort the processed names alphabetically.
    s   =   s  .  map  (  (  name  )   =>   {
        let   result   =   ""  ; // String to build the processed name.
        let   flg   =   true  ; // Flag: true if the next character should be included (either first char or after a vowel).

        // Iterate through each character of the original name.
        for   (  let   c   of   name  )   {
            if   (  flg  )   { // If the flag is set, append the character.
                result   +=   c  ;
                flg   =   false  ; // Reset the flag after appending.
            }
            // Check if the current character is a vowel (case-insensitive implied by regex, but input is usually lowercase).
            if   (  /  [  aiueo  ]  /  .  test  (  c  )  )   {
                flg   =   true  ; // If it's a vowel, set the flag to include the next character.
            }
        }
        return   result  ; // Return the modified name.
    }  )  .  sort  (  )  ; // Sort the entire array of processed names.


    // Helper function to count the length of the common prefix between two strings.
    // Returns the index where they first differ, or -1 if they are identical, or 'l' if one is a prefix of the other.
    let   countDuplicate   =   (  s1  ,   s2  )   =>   {
        let   l   =   Math  .  min  (  s1  .  length  ,   s2  .  length  )  ; // Get the minimum length of the two strings.

        // Loop through characters up to 'n' (note: 'n' is the total count of names, not 'l', which might be a bug in original logic but must be preserved).
        for   (  let   i   =   0  ;   i   <   n  ;   i  ++  )   {
            // If characters at current index are different, return this index.
            if   (  s1  [  i  ]   !=   s2  [  i  ]  )   {
                return   i  ;
            }
        }
        // If the loop completes, strings are identical up to 'n' (or 'l' if 'n' was replaced).
        if   (  s1  .  length  ==  s2  .  length  ) // If both strings have the same length and are identical.
            return   -1  ; // Indicate a full match.
        return   l  ; // Return the minimum length if one is a prefix of the other.
    }  ;


    let   result   =   0  ; // Initialize the maximum common prefix length found.

    // Iterate through the sorted array of processed names to find the longest common prefix among adjacent names.
    for   (  let   i   =   0  ;   i   <   n  ;   i  ++  )   {
        if   (  i  ==  0  ) // Skip the first element as there's no preceding element to compare with.
            continue  ; // Proceed to the next iteration.

        // Calculate the common prefix length between the current name and the previous one.
        let   c   =   countDuplicate  (  s  [  i  -  1  ]  ,   s  [  i  ]  )  ;

        if   (  c  ==  -1  )   { // If a full duplicate (s1 and s2 are identical and same length).
            result   =   -2  ; // Set a special indicator for full duplication.
            break  ; // No need to check further, break the loop.
        }

        if   (  c   >   result  )   { // If the current common prefix is longer than the maximum found so far.
            result   =   c  ; // Update the maximum common prefix length.
        }
    }

    // Output the final result, incremented by 1 (common practice for 1-based indexing in problems).
    console  .  log  (  result   +   1  )  ;
} // End of main processing loop.