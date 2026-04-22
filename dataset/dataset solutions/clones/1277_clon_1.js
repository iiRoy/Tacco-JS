/*  This is a JavaScript program designed to identify and list
 *  playing cards that are NOT present in a given input set.
 *  It simulates a deck of 52 cards and removes those specified.
 */


//  The 'fs' module is essential for file system operations,
//  which includes reading from standard input (stdin).
//  'readFileSync(0, 'ascii')' reads the entire content of stdin.
//  '.split('\n')' then breaks this content into an array of strings,
//  where each string represents a line from the input.
line  =  require ( 'fs' ) . readFileSync ( 0 , 'ascii' ) . split ( '\n' ) ;


//  The very first line of the input is expected to be an integer.
//  This integer indicates the total number of card entries that follow.
//  'parseInt(line[0])' converts this string number into an actual integer.
//  '.slice(1, ...)' creates a new array containing only the card entries,
//  effectively skipping the initial count line and including up to
//  the specified number of lines (count + 1, as slice is exclusive for end).
line  =  line . slice ( 1 , parseInt ( line [ 0 ] ) + 1 ) ;


//  'num_to_card' is an array that serves as a lookup table.
//  It maps a numeric index (0-3) to its corresponding card suit character.
//  0: Spades ('S'), 1: Hearts ('H'), 2: Clubs ('C'), 3: Diamonds ('D').
num_to_card  =  [ 'S' , 'H' , 'C' , 'D' ] ;


//  'card_to_num' is an object (hash map) for quick lookups.
//  It translates a card suit character back into a base numeric value.
//  This base value is crucial for calculating the 0-indexed position
//  of a card within a flat 52-element array representation of a deck.
//  Each suit has 13 cards, so 'H' starts at index 13, 'C' at 26, 'D' at 39.
card_to_num  =  { 'S' : 0 , 'H' : 13 , 'C' : 13 * 2 , 'D' : 13 * 3 } ;


//  'map' is initialized as an empty array.
//  It will eventually become a boolean array of 52 elements,
//  where each element represents the presence (true) or absence (false)
//  of a specific card in the deck.
map  =  [ ] ;


//  This loop populates the 'map' array.
//  For all 52 possible cards in a standard deck,
//  it initially sets their status to 'true', meaning they are all present.
for ( i = 0 ; i < 52 ; i ++ ) map . push ( true ) ; // All 52 cards are initially considered present.


//  Now, iterate over each line of input that represents a card.
//  These are the cards that we need to mark as 'removed' from our deck.
line . forEach ( function ( line )
{
    //  Each 'line' string (e.g., "S 1") is split into its components:
    //  the suit character (e.g., "S") and the rank number (e.g., "1").
    var ary  =  line . split ( ' ' ) ;

    //  Calculate the unique 0-indexed position of this card in the 'map' array.
    //  'card_to_num[ary[0]]' gets the base index for the suit.
    //  'parseInt(ary[1])' converts the card's rank (1-13) to an integer.
    //  '- 1' adjusts the rank to be 0-indexed (0-12) for array access.
    //  Finally, set the boolean value at this calculated index to 'false',
    //  indicating that this specific card has been removed from the deck.
    map [ card_to_num [ ary [ 0 ] ] + parseInt ( ary [ 1 ] ) - 1 ] = false ;
} ) ;


//  After processing all the input cards, this section iterates through
//  all possible 52 cards in a standard deck, suit by suit, rank by rank.
for ( i = 0 ; i < 4 ; i ++ ) // Outer loop for each of the 4 suits (0-3).
    for ( j = 0 ; j < 13 ; j ++ ) // Inner loop for each of the 13 ranks (0-12).
        // Check if the current card (calculated by i*13+j) is still 'true' in the 'map'.
        // A 'true' value means the card was NOT specified in the input,
        // and therefore, it is one of the cards that *remains* in the deck.
        if ( map [ i * 13 + j ] ) console . log ( num_to_card [ i ] , j + 1 ) ; // If present, print its suit and its 1-based rank.

//  The program concludes after listing all the remaining cards.