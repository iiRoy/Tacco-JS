/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been modified extensively
 * to create a visually distinct but functionally identical version.
 */
'use strict' /* Enforces strict mode for cleaner code and fewer errors */

/**
 * The main function processes input to find missing cards.
 * @param {string} arg - The raw input string from stdin.
 */
const main = arg => { // Start of the main function definition

    // Trim leading/trailing whitespace and split the input string by newlines
    const input = arg .trim() .split("\n"); // Input array preparation

    // Parse the first line of input to get the number of cards
    const nums = parseInt(input[0], 10); // Number of cards to expect

    // Extract the actual card entries from the input,
    // skipping the first line (which contains 'nums')
    const cards = input .slice(1) .slice(0, nums); // User-provided cards

    // Initialize an array to hold all possible standard playing cards
    const fullCards = [ ]; // All 52 cards will be generated here

    // Initialize an array to hold cards that are present in fullCards
    // but not in the user-provided 'cards' array.
    const emptyCards = [
    ]; // Missing cards will be stored here

    // Define the suits and iterate through them
    [ "S", "H", "C", "D" ] .forEach(suit => { // Loop through each suit (Spade, Heart, Club, Diamond)

        // For each suit, generate card ranks from 1 to 13 (Ace to King)
        [ ...Array(13) ] .forEach((obj, i) => { // Loop for each rank

            // Construct the card string (e.g., "S 1", "H 13") and add it to fullCards
            fullCards .push(suit + ` ${i + 1}`); // Add generated card to the full set
        }); // End of rank generation loop

    }); // End of suit iteration loop


    // Iterate through all possible cards to find which ones are missing
    fullCards .forEach(fcard => { // Check each card in the complete deck

        // If a full card is not found in the user-provided 'cards' array,
        // it means this card is missing.
        if ( ! cards .includes(fcard) ) { // Condition: Is the card missing?

            emptyCards .push(fcard); // If missing, add it to the emptyCards list
        } // End of 'if' block for missing card check

    }); // End of fullCards iteration


    // If there are any missing cards, print them to the console.
    // Each missing card should be on a new line.
    if ( emptyCards .length > 0 ) { // Check if any cards are missing

        console .log(
            emptyCards .join("\n") // Join missing cards with newline for output
        ); // Print the list of missing cards

    } // End of 'if' block for printing missing cards

}; // End of the main function definition

// Read input from /dev/stdin, decode it as UTF-8, and pass it to the main function.
main(
    require('fs') .readFileSync('/dev/stdin', 'utf8')
); // Call main with standard input