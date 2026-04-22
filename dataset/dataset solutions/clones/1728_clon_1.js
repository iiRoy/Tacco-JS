"use strict"; // This directive enables strict mode, ensuring cleaner code practices.

// The main function serves as the entry point for processing the input.
const   main    =   arg =>  {

    // First, process the raw input string.
    // It trims any leading/trailing whitespace and then splits it into an array of lines.
    const   input   =   arg .   trim    (   )   .   split   (   "\n"    )   ;



    // The first line of input typically contains configuration or limits.
    // It's split by spaces and each part is converted to a number.
    let firseRow    =   input   [   0   ]   .   split   (   ' ' )   .   map (   Number  )   ;



    // The second line represents the first set of items or books, each with a numerical value (e.g., time).
    // Similar to the first row, it's parsed into an array of numbers.
    let secondRow   =   input   [   1   ]   .   split   (   ' ' )   .   map (   Number  )   ;



    // The third line represents the second set of items or books.
    // Also parsed into an array of numbers.
    let thirdRow    =   input   [   2   ]   .   split   (   ' ' )   .   map (   Number  )   ;



    // Initialize a variable to keep track of the total accumulated time.
    let sumTime     =   0   ;

    // Initialize a variable to count the total number of books (or items) processed.
    let sumBook     =   0   ;


    // Define a recursive helper function 'tt'. This function appears to simulate
    // picking books from two piles within a given time limit.
    function    tt  (   arr1    ,   arr2    ,   sumT    ,   limit   ,   books   )   {

        // --- Termination Conditions for the Recursion ---

        // Condition 1: If the accumulated time 'sumT' has exceeded the 'limit'.
        if  (   sumT    >   limit   )
        {
            // If the limit is exceeded, it means the last book taken pushed it over.
            // So, we report one less book than currently counted.
            console .   log (   books   -   1   )   ;
            return  ; // Exit the function.
        }
        // Condition 2: If the accumulated time 'sumT' exactly equals the 'limit'.
        else    if  (   sumT    ==  limit   )
        {
            // If the time is exactly the limit, all books up to this point are valid.
            console .   log (   books   )   ;
            return  ; // Exit the function.
        }
        // Condition 3: If both arrays (piles of books) are empty, AND the time limit was exceeded.
        else    if  (   arr1    .   length  === 0   &&  arr2    .   length  === 0   &&  sumT    >   limit   )
        {
            // This is similar to Condition 1, implying the last book was too much.
            console .   log (   books   -   1   )   ;
            return  ; // Exit the function.
        }
        // Condition 4: If both arrays (piles of books) are empty, meaning no more books to choose.
        else    if  (   arr1    .   length  === 0   &&  arr2    .   length  === 0   )
        {
            // If there are no more books, and the time limit wasn't exceeded by the current `sumT`,
            // the logic here still reports `books - 1`. This implies that the problem statement
            // might be looking for the *maximum* number of books that *can be read within* the limit,
            // and the `books` counter might be incremented *before* checking the limit.
            console .   log (   books   -   1   )   ;
            return  ; // Exit the function.
        }

        // --- Recursive Step: Choosing the Next Book ---

        // This block handles the scenario where both piles of books still have items.
        // The strategy is to pick the book with the shorter reading time.
        if  (   arr1    .   length  !== 0   &&  arr2    .   length  !== 0   )
        {
            // If the first book in 'arr1' takes longer or equal time than 'arr2's first book,
            // choose the book from 'arr2'.
            if  (   arr1    [   0   ]   >=  arr2    [   0   ]   )
            {
                sumT    =   sumT    +   arr2    [   0   ]   ;   // Add the time of the chosen book.
                arr2    .   shift   (   )   ;                   // Remove the chosen book from 'arr2'.
                books   =   books   +   1   ;                   // Increment the count of books read.
            }
            // Otherwise, if 'arr2's first book takes longer, choose the book from 'arr1'.
            else    if  (   arr2    [   0   ]   >   arr1    [   0   ]   )
            {
                sumT    =   sumT    +   arr1    [   0   ]   ;   // Add the time of the chosen book.
                arr1    .   shift   (   )   ;                   // Remove the chosen book from 'arr1'.
                books   =   books   +   1   ;                   // Increment the count of books read.
            }
        }
        // This block handles the scenario where 'arr1' is empty, but 'arr2' still has books.
        else    if  (   arr1    .   length  === 0   &&  arr2    .   length  !== 0   )
        {
            sumT    =   sumT    +   arr2    [   0   ]   ;       // Add the time of the only available book.
            arr2    .   shift   (   )   ;                       // Remove the book from 'arr2'.
            books   =   books   +   1   ;                       // Increment the book count.
        }
        // This block handles the scenario where 'arr2' is empty, but 'arr1' still has books.
        else    if  (   arr2    .   length  === 0   &&  arr1    .   length  !== 0   )
        {
            sumT    =   sumT    +   arr1    [   0   ]   ;       // Add the time of the only available book.
            arr1    .   shift   (   )   ;                       // Remove the book from 'arr1'.
            books   =   books   +   1   ;                       // Increment the book count.
        }


        // Perform the recursive call with the updated state (modified arrays, new sumT, new books count).
        tt  (   arr1    ,   arr2    ,   sumT    ,   limit   ,   books   )   ;
    }


    // Initiate the recursive process by calling 'tt' with the initial values:
    // - 'secondRow' and 'thirdRow' as the two book piles.
    // - 'sumTime' initialized to 0.
    // - 'firseRow[2]' as the time limit (assuming the third element of the first row is the limit).
    // - 'sumBook' initialized to 0.
    tt  (   secondRow   ,   thirdRow    ,   sumTime ,   firseRow    [   2   ]   ,   sumBook )   ;
}

// Execute the 'main' function.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
main    (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   )   ;