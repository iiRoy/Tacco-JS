// This script processes student scores from standard input.
// It determines a grade based on midterm, final, and retake scores.
// Each line of input represents a student's scores.

var      input     =      require('fs').readFileSync('/dev/stdin', 'utf8'); // Reads all input data from standard input.
                                                                                // The 'utf8' encoding is specified.


// The raw input string is trimmed for leading/trailing whitespace,
// then split into an array of strings, where each string is a line.
var arr   =   input.trim().split("\n");


// This is the main processing loop. It continues indefinitely
// until a specific termination condition is met.
while    (   true   )    {

    // Retrieves and removes the first element (line) from the 'arr' array.
    var     x     =     arr.shift();


    // Checks if the current line represents the termination sentinel value.
    if    (    x    ===    "-1 -1 -1"    )    {
        break; // Exits the while loop if the sentinel is found.
    }


    // Parses the scores from the current line.
    // The line is split by spaces, and each resulting string is converted to a Number.
    var     ary     =     x.split(" ").map(Number);

    // Assigns the parsed scores to individual, descriptive variables.
    var     m     =     ary[0]; // Midterm score
    var     f     =     ary[1]; // Final exam score
    var     r     =     ary[2]; // Retake score


    // Initializes the grade variable to 'F' (Fail) by default.
    var     ans     =     "F";


    // --- Start of Grade Calculation Logic ---

    // Condition 1: If either midterm or final score is -1 (indicating absence or invalid score),
    // the student automatically receives an 'F'.
    if    (    m    ===    -1    ||    f    ===    -1    )    {
        ans    =    "F";
    }
    // Condition 2: If the sum of midterm and final scores is 80 or greater, the grade is 'A'.
    else    if    (    m    +    f    >=    80    )    {
        ans    =    "A";
    }
    // Condition 3: If the sum of midterm and final scores is 65 or greater (but less than 80), the grade is 'B'.
    else    if    (    m    +    f    >=    65    )    {
        ans    =    "B";
    }
    // Condition 4: If the sum of midterm and final scores is 50 or greater (but less than 65), the grade is 'C'.
    else    if    (    m    +    f    >=    50    )    {
        ans    =    "C";
    }
    // Condition 5: If the sum of midterm and final scores is 30 or greater (but less than 50),
    // AND the retake score is 50 or greater, the grade is 'C'.
    else    if    (    m    +    f    >=    30    &&    r    >=    50    )    {
        ans    =    "C";
    }
    // Condition 6: If the sum of midterm and final scores is 30 or greater (but less than 50),
    // AND the retake score is less than 50, the grade is 'D'.
    else    if    (    m    +    f    >=    30    )    {
        ans    =    "D";
    }
    // Implicit: If none of the above conditions are met (e.g., m+f < 30 and m, f are not -1),
    // the grade remains 'F' as initialized.

    // --- End of Grade Calculation Logic ---


    // Prints the determined grade to the console for the current student.
    console.log(ans);

} // End of the main processing loop.