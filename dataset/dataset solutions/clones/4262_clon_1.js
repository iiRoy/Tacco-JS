function    myout (   text   )      {

    console.log( text ) ; // This function simply prints the given text to the console.

}



function    Main ( input )    {

    // Parse the input string into an integer.
    input = parseInt(    input    )    ;

    // The following lines are commented out, indicating alternative input parsing strategies.
    // They are left here for reference or future modifications.
    //input = input.trim().split(" ");
    //input = input.trim().split("\n");
    //input = input.trim().split(" ").map((a)=>Number(a));
    //input = input.trim().split("\n").map((a)=>Number(a));


    // Initialize output with a large number to ensure Math.min correctly finds the smallest sum.
    var    output    =    1000000000    ;


    // Loop from 1 to 10 (inclusive) to calculate sums for multiples of the input.
    for (    var    i    =    1    ;    i    <=    10    ;    i    ++    )    {

        // Calculate the current multiple, convert it to a string, then split into individual digits,
        // and finally convert each digit back to a number.
        var    tmp    =    ( input    *    i ).toString().split( "" ).map( (    a    )    =>    Number( a ) )    ;

        // Initialize a variable to accumulate the sum of digits for the current multiple.
        var    check    =    0    ;

        // Iterate through the digits of the current multiple to sum them up.
        for    (    var    j    =    0    ;    j    <    tmp.length    ;    j    ++    )    {

            check    +=    tmp[ j ]    ; // Add the current digit to the sum.

        }

        // Update the minimum output if the current sum of digits is smaller.
        output    =    Math.min(    output    ,    check    )    ;

    }

    // Display the final minimum sum of digits found.
    myout(    output    )    ;

}


// Execute the Main function with input read from standard input.
Main(    require( "fs" ).readFileSync( "/dev/stdin" ,    "utf8"    ).trim()    )    ;