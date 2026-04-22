// This is the main function definition. It takes 'input' as a parameter.
function    Main    (    input    )    {

    // First, the input string is trimmed to remove leading/trailing whitespace.
    // Then, it is split into an array of strings based on spaces.
    // The resulting array is stored in a constant variable named 'array'.
    const    array    =    input.trim().split(' ')    ;

    // The first element of the 'array' (at index 0) is parsed as an integer.
    // This integer value is assigned to the constant variable 'T'.
    const    T    =    parseInt(    array[0]    )    ;

    // Similarly, the second element of the 'array' (at index 1) is parsed as an integer.
    // This integer value is assigned to the constant variable 'X'.
    const    X    =    parseInt(    array[1]    )    ;


    // A variable named 'ans' is declared using 'var'.
    // It stores the result of the division of 'T' by 3.
    var    ans    =    T    /    3    ;

    // Finally, the calculated 'ans' value is printed to the console.
    console.log(    ans    )    ;

}

// This line is responsible for reading input from the standard input stream.
// 'require("fs")' imports the file system module.
// 'readFileSync("/dev/stdin", "utf8")' reads the content of '/dev/stdin' as a UTF-8 string.
// The read content is then passed as an argument to the 'Main' function, initiating the program execution.
Main    (    require("fs").readFileSync("/dev/stdin", "utf8")    )    ;