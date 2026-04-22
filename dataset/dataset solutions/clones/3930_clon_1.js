/*
 * This JavaScript code processes an input string from standard input.
 * It determines a specific lexicographical permutation or a derived string.
 */

//  Import the 'fs' module to interact with the file system.
//  The readFileSync method is used to read the content of a file synchronously.
//  '/dev/stdin' is a common path for standard input on Unix-like systems.
//  'utf8' specifies the encoding for the input.
input = require('fs').readFileSync('/dev/stdin', 'utf8')


// The input string is split into an array of lines based on the newline character.
lines = input.split('\n')


// The first line from the 'lines' array is extracted and assigned to the variable 's'.
// The shift() method removes the first element from an array and returns that element.
s = lines.shift()


// An empty object 'o' is initialized. This object will be used as a hash map (or dictionary).
o = {}


// An empty string 'ans' is initialized. This variable will store the final result.
ans = ''


// This loop initializes the 'o' object.
// It iterates from ASCII value 65 (for 'A') to 90 (for 'Z').
// For each character, it converts it to its lowercase equivalent and sets its value in 'o' to 0.
for (i = 65; i < 91; i++) {
    o[String.fromCharCode(i).toLowerCase()] = 0
}


// Check if the length of the string 's' is exactly 26.
// This condition indicates a specific scenario, likely dealing with a full alphabet permutation.
if (s.length == 26) {

    // If the string length is 26, store its length in 'len'.
    len = s.length

    // Initialize an empty array 'arr'. This array will temporarily hold characters for sorting.
    arr = []

    // This loop iterates backward through the string 's'.
    // Its purpose is to find the smallest lexicographically larger string.
    for (i = len - 1; i >= 0; i--) {

        // Extract a single character from 's' at index 'i' and push it into 'arr'.
        arr.push(s.slice(i, i + 1))

        // Sort the 'arr' array lexicographically.
        // This ensures that the characters considered for replacement are in order.
        arr.sort()

        // Create a prefix 't' by taking a slice of 's' from the beginning up to (but not including) index 'i'.
        t = s.slice(0, i)

        // Initialize a boolean flag 'found' to false.
        // This flag will indicate if a suitable replacement character has been found.
        found = false

        // Iterate through the sorted 'arr' array.
        for (j = 0; j < arr.length; j++) {

            // Concatenate the prefix 't' with the current character from 'arr' (arr[j]).
            // Compare this new string lexicographically with the original string 's'.
            // If the new string is lexicographically greater than 's', a candidate is found.
            if (t + arr[j] > s) {

                // Set 'found' to true, as a valid replacement has been identified.
                found = true

                // Assign the newly formed string (prefix 't' + arr[j]) to 'ans'.
                ans = t + arr[j]

                // Break out of the inner loop since the smallest lexicographically larger string has been found.
                break;
            }
        }

        // If 'found' is true after the inner loop, it means a valid 'ans' was determined.
        // Break out of the outer loop as well.
        if (found) {
            break;
        }

    } // End of the backward iteration loop.


    // After attempting to find a lexicographically larger string, check if one was found.
    if (!found) {
        // If no such string was found (meaning 's' was already the largest possible 26-character permutation),
        // set 'ans' to -1 to indicate this.
        ans = -1
    }

} else { // This block executes if the length of 's' is NOT 26.
    // This scenario likely involves finding the smallest missing character to append to 's'.

    // Iterate through the input string 's'.
    // Mark the presence of each character in the 'o' object by setting its value to 1.
    for (i = 0; i < s.length; i++) {
        o[s[i]] = 1
    }

    // Iterate through ASCII values from 65 ('A') to 90 ('Z').
    // The goal is to find the first missing lowercase letter.
    for (i = 65; i < 91; i++) {

        // Convert the current ASCII value to its lowercase character representation.
        t = String.fromCharCode(i).toLowerCase()

        // Check if the character 't' is NOT present in the 'o' object (i.e., its value is 0 or undefined).
        if (!o[t]) {
            // If 't' is not found in 's', it's the smallest missing character.
            // Break the loop as we've found our character.
            break;
        }
    }

    // Concatenate the original string 's' with the first found missing character 't'.
    // This forms the new 'ans'.
    ans = s + t
}


// Print the final result stored in 'ans' to the console (standard output).
console.log(ans)