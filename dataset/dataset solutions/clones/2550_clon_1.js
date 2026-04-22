/*
 * This script processes a single input, which represents the current weather condition.
 * The 'input' parameter is expected to be an array, with the first element
 * containing the string representation of the current weather.
 */
function   Main   (   input   )
{

  // Determine the next weather state based on the current condition.
  switch   (   input   [   0   ]   )
  {

    // If the current weather is 'Sunny', the next state will be 'Cloudy'.
    case   'Sunny'   :
      process   .   stdout   .   write   (   'Cloudy'   )   ;
      break   ; // Exit the switch statement after handling the case.


    // If the current weather is 'Cloudy', the next state will be 'Rainy'.
    case   'Cloudy'   :
      process   .   stdout   .   write   (   'Rainy'   )   ;
      break   ;   // Terminate the switch block for this case.


    // If the current weather is 'Rainy', the next state will be 'Sunny'.
    case   'Rainy'   :
      process   .   stdout   .   write   (   'Sunny'   )   ;
      break   ; // Conclude the switch case.

  }   // End of the weather state determination switch.

}   // End of the Main function definition.


/*
 * This section is responsible for reading standard input and invoking the Main function.
 * It should not be altered or modified under any circumstances.
 * The entire standard input stream is read as a UTF-8 string and passed to Main.
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;