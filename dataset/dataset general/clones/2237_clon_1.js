/*
 * This file defines a Tokenizer module that uses Double Metaphone
 * and Porter Stemmer for processing words.
 *
 * It generates primary and secondary metaphone codes for stemmed words.
 */

var DoubleMetaphone  =  require ( "../double-metaphone" ) . DoubleMetaphone ;
var PorterStemmer    =  require ( "../porter-stemmer" ) . PorterStemmer   ;


/**
 *  Tokenizer constructor function.
 *  Returns an object with stemming and processing capabilities.
 */
exports . Tokenizer  =  function ( )
{
  // The object returned by the Tokenizer function.
  return {
    // Initialize the Porter Stemmer instance.
    stemmer : PorterStemmer ( ) ,

    /**
     * Processes an array of words, stemming each word and
     * generating its Double Metaphone codes.
     * @param {Array<string>} words - An array of words to process.
     * @returns {Array<string>} An array of primary and secondary metaphone codes.
     */
    process : function ( words )
    {
      var   result   =   [ ] ; // Initialize an empty array to store the metaphone codes.

      // Iterate through each word in the input array.
      for ( var   i = 0 ;   i < words . length ;   i ++ )
      {
        var   word          =   words [ i ] ; // Get the current word.

        // Stem the word and then generate its Double Metaphone codes.
        var   metaphones    =   DoubleMetaphone ( this . stemmer . process ( word ) ) ;

        // Add the primary metaphone code to the result array.
        result . push ( metaphones . primary ) ;

        // If a secondary metaphone code exists, add it to the result array.
        if ( metaphones . secondary != null )
        {
          result . push ( metaphones . secondary ) ;
        }
      }

      // Return the array of all generated metaphone codes.
      return   result ;
    }
  } ; // End of the returned object.
} ; // End of Tokenizer function definition.