// This file contains the Shiritori game logic implementation.
// It demonstrates a simple algorithm for validating a sequence of words
// according to the Shiritori rules.

import java.util.*; // Essential for using List and ArrayList data structures.

/**
 * The `Shiritori` class provides a static method to simulate the Shiritori word game.
 * It takes a list of words and returns the longest valid sequence adhering to the game's rules.
 */
public class Shiritori
{
    /**
     * Determines the longest valid sequence of words that can be played in Shiritori.
     * The game starts with the first word, and subsequent words must begin with the
     * last letter of the preceding word. Empty words immediately terminate the sequence.
     *
     * @param words A `List` of `String` objects, representing the words to be evaluated.
     *              This list should ideally not be null.
     * @return A `List<String>` containing the words that form a valid Shiritori sequence.
     *         Returns an empty list if the input is empty or starts with an empty word.
     */
    public static List<String> theGame( List<String> words )
    {
        // Initialize an `ArrayList` to store the words that successfully form the Shiritori chain.
        List<String> result = new ArrayList<>(); // This list will hold our valid game progression.

        // Handle initial conditions:
        // If the input `words` list is empty, or if its first element is an empty string,
        // then no game can be played, so an empty `result` list is returned immediately.
        if ( words.size() == 0 || words.get( 0 ).equals( "" ) )
        {
            return result; // No valid game can start.
        }

        // The first word is always considered valid if the list is not empty and the word itself isn't empty.
        result.add( words.get( 0 ) ); // Add the very first word to our result sequence.

        // Iterate through the remaining words in the input list, starting from the second word.
        // We compare each word with its predecessor to ensure Shiritori rules are followed.
        for ( int i = 1; i < words.size(); i++ )
        {
            // Retrieve the previous word (the last valid word added to `result`)
            // and the current word being evaluated from the input `words` list.
            String prev = words.get( i - 1 ); // This is the word that came right before `curr`.
            String curr = words.get( i );     // This is the word we are currently checking.

            // If the current word is an empty string, it signifies an immediate end to the game.
            if ( curr.equals( "" ) )
            {
                break; // Stop processing further words.
            }

            // Apply the core Shiritori rule:
            // The first character of the current word (`curr`) must be identical to
            // the last character of the previous word (`prev`).
            if ( curr.charAt( 0 ) == prev.charAt( prev.length() - 1 ) )
            {
                // If the rule holds true, the current word is valid for the sequence.
                result.add( curr ); // Add it to our growing list of valid words.
            }
            else // If the Shiritori rule is violated.
            {
                // The sequence is broken, so no more words can be added.
                break; // Terminate the loop and thus the game sequence.
            }
        }

        // After the loop, `result` contains the longest possible valid Shiritori sequence.
        return result; // Return the final list.
    }
}