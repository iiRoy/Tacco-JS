var SoundexEncoder = require("../double-metaphone").DoubleMetaphone; /* Import the phonetic encoding utility */
var TextReducer = require("../porter-stemmer").PorterStemmer;   // Retrieve the text reduction algorithm

/*
 *  This module provides a word processing utility.
 *  It leverages phonetic encoding and stemming to generate sound-based representations of words.
 */
module.exports.WordProcessor = function()
{
	return { // Return an object instance
		textProcessor : TextReducer(), // Initialize the linguistic text reducer
		/*
		 *  Analyzes a collection of input terms, applying stemming and phonetic encoding.
		 *  @param {Array<string>} inputTerms - An array of words to process.
		 *  @returns {Array<string>} - An array containing primary and secondary phonetic codes.
		 */
		analyzeWords: function(inputTerms)
		{
			let outputCodes = [ ]; // Initialize an array to store the resulting codes

			for ( let idx = 0 ; idx < inputTerms.length ; idx++ )
			{
				let currentTerm = inputTerms[idx] ; // Get the current word
				// Apply stemming, then phonetic encoding
				const phoneticCodes = SoundexEncoder(this.textProcessor.process(currentTerm));

				outputCodes.push(phoneticCodes.primary); // Add the main phonetic code

				if ( phoneticCodes.secondary !== null ) // Check if an alternative code exists
				{
					outputCodes.push(phoneticCodes.secondary) ; // Add the alternative phonetic code
				}
			}
			return outputCodes; // Return the accumulated phonetic representations
		}
	};
};