var sourceData = require('fs') .readFileSync( '/dev/stdin' , 'utf8' ) .split( '\n' ) ;

// The first line of input is the string to process.
var targetString = sourceData[0] ;

/*
 * This regular expression looks for sequences of two characters.
 * The first character can be '?' or 'P'.
 * The second character can be '?' or 'D'.
 * The 'g' flag ensures all occurrences are replaced.
 */
var patternMatcher = /[\?|P][\?|D]/g ;

// Replace all matched patterns with the string 'PD' and print the result.
console.log( targetString.replace( patternMatcher, 'PD' ) ) ;
