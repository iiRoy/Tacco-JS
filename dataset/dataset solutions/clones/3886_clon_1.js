// This is the entry point for reading standard input.
const input = require("fs").readFileSync("/dev/stdin", "utf8") ;

/*
 * This immediately-invoked function expression (IIFE)
 * encapsulates the main logic of the program.
 * It takes the 'input' string as an argument.
 */
;(input => {

    // Declare constants to store the parsed numeric values.
    // The input string is trimmed, split by space, and each part is converted to a Number.
    const [ A, B, C, X, Y ] = input
                                    .trim()
                                    .split(' ')
                                    .map(Number) ;

    // Calculate cost option 1: Buying A-pizzas and B-pizzas separately.
    const c1 = A * X + B * Y ;

    // Calculate cost option 2: Buying only AB-pizzas (C) to cover both X and Y.
    // This involves buying 2 * max(X, Y) AB-pizzas.
    const c2 = C * Math.max(X, Y) * 2 ;

    /*
     * Calculate cost option 3: A hybrid approach.
     * Buy min(X, Y) AB-pizzas (C) * 2.
     * Then buy remaining A-pizzas (if X > Y) or B-pizzas (if Y > X).
     * Math.max(X - Y, 0) handles the remaining A-pizzas.
     * Math.max(Y - X, 0) handles the remaining B-pizzas.
     */
    const c3 = A * Math.max(X - Y, 0) + B * Math.max(Y - X, 0) + C * Math.min(X, Y) * 2 ;

    // Output the minimum of the three calculated cost options to the console.
    console.log( Math.min(c1, c2, c3) ) ;

})(input) ; // Pass the 'input' variable to the IIFE.

// End of program logic.