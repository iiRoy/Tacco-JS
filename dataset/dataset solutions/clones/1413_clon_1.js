/*
 * This is the primary function responsible for the application's logic.
 * It processes an array of input lines, typically representing cards.
 */
function   main   (   lines   )
{
    // Initialize an empty object to store the state of all possible playing cards.
    // Each card will be a key, and its value will be a boolean (true if present, false if not).
    var   cards   =   {  }   ;

    // Define the four standard suits for playing cards.
    var   kinds   =   [ 'S' ,   'H' ,   'C' ,   'D' ]   ;


    // --- Card Initialization Loop ---
    // This nested loop populates the 'cards' object with all 52 standard cards,
    // initially marking all of them as 'true' (meaning they are present).
    for   (   var   ki   =   0   ;   ki   <   kinds . length   ;   ki ++   )
    {
        // Iterate through card ranks from Ace (1) to King (13).
        for   (   var   ii   =   1   ;   ii   <=   13   ;   ii ++   )
        {
            // Construct the card string (e.g., "S 1", "H 13") and set its initial state to true.
            cards  [  kinds  [  ki  ]   +   ' '   +   ii  ]   =   true   ;
        }
    }


    // --- Input Processing Loop ---
    // This loop processes the input 'lines' array. Each line is expected to be a card string.
    // Cards found in the input are marked as 'false' (i.e., they are removed or accounted for).
    // The loop starts from index 1, assuming the first line might be a count or irrelevant.
    for   (   var   i   =   1   ;   i   <   lines . length   ;   i ++   )
    {
        // Set the value of the card from the input line to 'false'.
        // This effectively "removes" the card from our initial set.
        cards  [  lines  [  i  ]  ]   =   false   ;
    }


    // --- Output Generation Loop ---
    // After processing all input, this loop iterates through the 'cards' object
    // to find any cards that are still marked as 'true'.
    for   (   card   in   cards   )
    {
        // Check if the current card's value is 'true'.
        // If true, it means this card was not present in the input lines.
        if   (   cards  [  card  ]   )
        {
            // Print the card to the standard output.
            console . log ( card )   ;
        }
    }
    ; // An optional semicolon, for stylistic consistency.
}


// Initialize an array to accumulate data chunks received from standard input.
var   chunks   =   [  ]   ;

// Set up an event listener for the 'data' event on the standard input stream.
// This event fires whenever a new piece of data is available to be read.
process . stdin . on ( 'data' ,   function   (   chunk   )
{
    // Append the received data 'chunk' to the 'chunks' array.
    chunks . push ( chunk )
}  )  ;


// Set up an event listener for the 'end' event on the standard input stream.
// This event fires when there is no more data to be read from standard input.
process . stdin . on ( 'end' ,   function   (   )
{
    // Join all the accumulated data chunks into a single string.
    // Then, split this string by newline characters to get an array of individual lines.
    var   lines   =   chunks . join ( '' ) . split ( '\n' )   ;

    // Call the main function with the array of processed lines.
    main ( lines )   ;
}  )  ;