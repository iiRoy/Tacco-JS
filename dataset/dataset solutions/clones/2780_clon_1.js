// This function processes the input string to determine a specific pattern.
function Main(input) {

    // Convert the entire input string into an array of individual characters.
    chars = input.split("");


    // The first character of the input is stored in 'letter'.
    // This character will be used for comparison and removal operations throughout the function.
    var letter = chars[0];

    // Remove the initial character from the 'chars' array as it has been stored.
    chars.splice(0, 1);

    // Create a new string 'replaced' by removing the first occurrence of 'letter' from the original input.
    var replaced = input.replace(letter, '');

    // Find the index of the next occurrence of 'letter' within the 'replaced' string.
    var search = replaced.search(letter);


    // If 'letter' was found in 'replaced', remove the character at that index from 'chars'.
    // This effectively removes the second occurrence of the initial 'letter' from the sequence.
    chars.splice(search, 1);

    // Remove the second occurrence of 'letter' from the 'replaced' string as well.
    replaced = replaced.replace(letter, '');

    // Search for any remaining occurrences of 'letter' in the string after two removals.
    search = replaced.search(letter);


    // Finally, check if the first two characters remaining in the 'chars' array are identical.
    // Based on this comparison, the program will output either "Yes" or "No".
    if (chars[0] == chars[1])
        console.log("Yes"); // Output "Yes" if the two characters match.
    else
        console.log("No"); // Output "No" if the two characters do not match.
}

// This section handles standard input/output operations for the program.
// Please refrain from editing any code below this line, as it is crucial for program execution.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));