"use strict" ; // This directive enables strict mode for the entire script, enforcing cleaner code practices.

/*
 * The primary function responsible for executing the program's core logic.
 * It processes input data, performs calculations, and outputs the final result.
 */
function ProcessData( dataSource ) {
  // Instantiate a data parser to facilitate structured input reading.
  let dataParser = new DataExtractor( dataSource ) ;

  // Fetch the total number of items, followed by two arrays of corresponding values and costs.
  let itemCount = dataParser.extractInteger( ) ,
      valuesArray = dataParser.extractIntegerArray( itemCount ) ,
      costsArray = dataParser.extractIntegerArray( itemCount ) ;

  // Create a new array to store the calculated net profit for each item.
  let netProfits = new Array( itemCount ) ;

  // Loop through each item to determine its individual net profit (value minus cost).
  for ( let idx = 0 ; idx < itemCount ; idx++ ) {
    netProfits[ idx ] = valuesArray[ idx ] - costsArray[ idx ] ;
  }

  // Calculate the sum of only the positive net profits, ignoring any losses.
  let totalProfit = netProfits.reduce( ( accumulator , currentProfit ) => accumulator + ( ( currentProfit > 0 ) ? currentProfit : 0 ) , 0 ) ;

  // Output the final computed total profit to the console.
  console.log( totalProfit ) ;
}


/*
 * The DataExtractor class provides utility methods for parsing raw text input.
 * It can extract individual numbers, strings, or arrays of these types from a given source.
 */
class DataExtractor {
  // The constructor initializes the extractor with the raw input text.
  constructor ( sourceText ) {
    // Validate that the source text argument is actually provided.
    if ( typeof sourceText === 'undefined' ) {
      throw new Error( 'The sourceText parameter cannot be omitted during initialization!' ) ;
    }
    this.positionIndex = 0 ; // Keeps track of the current reading position within the parsed tokens.
    this.parsedTokens = sourceText.split( /\n|\s/ ) ; // Splits the input string into an array of tokens based on newlines or spaces.
  }

  // Retrieves the next token from the parsed list and converts it into an integer.
  extractInteger ( ) {
    return this.parsedTokens[ this.positionIndex++ ] - 0 ; // The '- 0' effectively converts the string token to a number.
  }

  // Reads a specified number of integers and returns them as an array.
  extractIntegerArray ( size ) {
    // Ensures that the requested array size is a valid positive number.
    if ( typeof size === 'undefined' || size < 1 ) {
      throw new Error( 'The size parameter for extractIntegerArray must be 1 or greater!' ) ;
    }
    let resultArray = new Array( size ) ;
    for ( let loopVar = 0 ; loopVar < size ; loopVar++ ) {
      resultArray[ loopVar ] = this.extractInteger( ) ;
    }
    return resultArray ;
  }

  // Retrieves the next token from the parsed list as a string.
  extractString ( ) {
    return this.parsedTokens[ this.positionIndex++ ] ;
  }

  // Reads a specified number of strings and returns them as an array.
  extractStringArray ( length ) {
    // Ensures that the requested array length is a valid positive number.
    if ( typeof length === 'undefined' || length < 1 ) {
      throw new Error( 'The length parameter for extractStringArray must be 1 or greater!' ) ;
    }
    let stringCollection = new Array( length ) ;
    for ( let k = 0 ; k < length ; k++ ) {
      stringCollection[ k ] = this.extractString( ) ;
    }
    return stringCollection ;
  }
}

// This conditional block determines the execution environment.
// If the code is not running in a web browser (i.e., 'window' object is undefined),
// it reads input from standard input using Node.js 'fs' module and invokes the main processing function.
if ( typeof window === "undefined" ) {
  ProcessData( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;
}