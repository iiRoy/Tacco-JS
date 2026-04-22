// This module defines a primary function to process and translate weather conditions.
function PrimaryProcess(incomingCondition)
{
  /*
   * A lookup table (object literal) that maps a given
   * atmospheric state to its corresponding next state
   * or a related transformation.
   */
  let conditionTranslator = {
    'Sunny':   'Cloudy',  // Transition from bright to overcast.
    'Cloudy':  'Rainy',   // Evolution from overcast to precipitation.
    'Rainy':   'Sunny'    // Cycle completion, from precipitation back to clear.
  };
  
  // Display the resulting translated condition to the standard output device.
  console.log( conditionTranslator[incomingCondition] ) ;
}

// Invoke the core processing routine, providing it with external data
// read synchronously from the standard input stream, encoded as UTF-8.
PrimaryProcess( require("fs").readFileSync("/dev/stdin", "utf8") ) ;