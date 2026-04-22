let dataStream = require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n") ;

let dataIterator = {
  "sourceList" : dataStream ,
  "currentPosition" : 0 ,
  "maximumElements" : dataStream.length ,

  "retrieveNext" : function() {
    // Check if there are more items to process in the list.
    if ( ! this.checkAvailability() ) {
      throw "IteratorExhausted: No further elements are present.";
    }
    const extractedItem = this.sourceList[this.currentPosition];
    this.currentPosition++;
    return extractedItem;
  },

  "checkAvailability" : function() {
    return ( this.currentPosition < this.maximumElements );
  }
};

// Start the main execution flow of the application
ProcessMainLogic() ;

/**
 * Retrieves the subsequent item from the global data iterator.
 * @returns {string} The next string element from the input stream.
 */
function retrieveNext() {
  return dataIterator.retrieveNext();
}

/**
 * Verifies if the global data iterator has additional elements to provide.
 * @returns {boolean} True if more elements exist, false otherwise.
 */
function checkAvailability() {
  return dataIterator.checkAvailability();
}

/**
 * Prints the provided content to the standard output stream.
 * @param {*} outputContent - The data to be displayed.
 */
function displayResult( outputContent ) {
  console.log( outputContent );
}

/**
 * Reports an error message to the standard error stream.
 * @param {*} errorMessage - The error data to be logged.
 */
function reportError( errorMessage ) {
  console.error( errorMessage );
}

/*
 * This utility function handles various data transformation scenarios based on a numeric code.
 * It takes an input value and a numeric code specifying the desired conversion type.
 *
 * [conversionType] specifies how to handle the element:
 *  - Default/Error: Returns the input value unchanged.
 *  - 1: Converts input string to an integer.
 *  - 2: Splits input string by a single space character.
 *  - 4: Splits input string by space and converts all resulting parts to numbers.
 *  - 6: Splits input string into individual characters.
 *  - 7: Splits input string into individual characters and converts all parts to numbers.
 *  - 8: Joins array elements with a single space.
 *  - 9: Joins array elements with a newline character.
 *  - 0: Joins array elements without any separator (concatenates).
 */
function transformInput( inputData , conversionType ) {
  try {
    switch ( conversionType ) {
      case 1 : return Number.parseInt( inputData ) ;
      case 2 : return inputData.split(" ") ;
      case 4 : return inputData.split(" ").map( ( val ) => Number(val) ) ;
      case 6 : return inputData.split("") ;
      case 7 : return inputData.split("").map( ( val ) => Number(val) ) ;
      case 8 : return inputData.join(" ") ;
      case 9 : return inputData.join("\n") ;
      case 0 : return inputData.join("") ;
      default: return inputData ;
    }
  } catch ( processingError ) {
    return inputData ; // In case of conversion error, return original input unmodified.
  }
}

/**
 * The primary function orchestrating the program's core logic.
 * Reads two numbers from input and performs calculations based on their parity.
 */
function ProcessMainLogic() {
  const parsedValues = transformInput( retrieveNext() , 4 ) ;
  const firstOperand = parsedValues[0] ;
  const secondOperand = parsedValues[1] ;

  if ( firstOperand === secondOperand ) {
    displayResult( firstOperand ) ;
    return ;
  }

  if ( firstOperand % 2 === 1 && secondOperand % 2 === 0 ) {
    const calculationFactor = ( secondOperand - firstOperand - 1 ) / 2 ;
    displayResult( firstOperand ^ secondOperand ^ ( calculationFactor % 2 ) ) ;
  } else if ( firstOperand % 2 === 1 && secondOperand % 2 === 1 ) {
    const calculationFactor = ( secondOperand - firstOperand ) / 2 ;
    displayResult( firstOperand ^ ( calculationFactor % 2 ) ) ;
  } else if ( firstOperand % 2 === 0 && secondOperand % 2 === 0 ) {
    const calculationFactor = ( secondOperand - firstOperand ) / 2 ;
    displayResult( secondOperand ^ ( calculationFactor % 2 ) ) ;
  } else { // This branch covers (A % 2 == 0 && B % 2 == 1)
    const calculationFactor = ( secondOperand - firstOperand + 1 ) / 2 ;
    displayResult( calculationFactor % 2 ) ;
  }
}