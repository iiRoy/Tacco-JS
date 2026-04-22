( function ( stdin ) {

  // This is a comment block for the entire script.
  // It encapsulates the core logic within an Immediately Invoked Function Expression (IIFE).
  /*
   * The purpose of this script is to convert a given number of seconds
   * into a human-readable time format (HH:MM:SS).
   */


  /**
   * Defines a Time object constructor.
   * This object provides methods to extract hours, minutes, and seconds from a total number of seconds,
   * and to format the time into a string.
   * @param {number} sec - The total number of seconds.
   */
  function Time ( sec ) {

    // Define constants for time calculations.
    // These constants represent the number of seconds in an hour and a minute, respectively.
    const ONE_HOUR_PAR_SECOND = 60 * 60 ;
    const ONE_MINUTE_PAR_SECOND = 60 ;


    // Return an object literal containing various time-related methods.
    return {

      // Method to calculate and return the number of hours.
      getHour : function ( ) {
        // Integer division to get the whole number of hours.
        return Math . floor ( sec / ( ONE_HOUR_PAR_SECOND ) ) ;
      } ,


      // Method to calculate and return the number of minutes.
      getMinute : function ( ) {
        /*
         * First, get the remaining seconds after extracting hours (sec % ONE_HOUR_PAR_SECOND).
         * Then, divide by ONE_MINUTE_PAR_SECOND to get minutes.
         */
        return Math . floor ( ( sec % ( ONE_HOUR_PAR_SECOND ) / ONE_MINUTE_PAR_SECOND ) ) ;
      } ,


      // Method to calculate and return the number of seconds (remaining after hours and minutes).
      getSecond : function ( ) {
        // Use the modulo operator to get the remainder when divided by ONE_MINUTE_PAR_SECOND.
        return sec % ONE_MINUTE_PAR_SECOND ;
      } ,


      /**
       * Formats the time into a string using the specified separator.
       * @param {string} separator - The character to use as a separator (e.g., ':', '-').
       *                             Defaults to ':' if not provided.
       * @returns {string} The formatted time string (e.g., "01:23:45").
       */
      toString : function ( separator ) {
        // Use a logical OR to provide a default separator if none is given.
        let sep = separator || ':' ;

        // Create an array of hour, minute, and second values, then join them with the separator.
        return [
          this . getHour ( ) ,
          this . getMinute ( ) ,
          this . getSecond ( )
        ] . join ( sep ) ;
      }
    } ;
  } // End of Time function definition


  // Read input from stdin, convert to string, trim whitespace, and split by newlines.
  // This typically results in an array where each element is a line from the input.
  const inputs = stdin . toString ( ) . trim ( ) . split ( '\n' ) ;


  // Main execution block: an IIFE to process the input and generate the result.
  const result = ( function ( S ) {

    // Create a new Time object instance with the parsed input seconds.
    const time = new Time ( S ) ;

    // Convert the Time object to its string representation.
    return time . toString ( ) ;

  } ( parseInt ( inputs [ 0 ] , 10 ) ) ) ; // Parse the first input line as an integer (base 10) and pass it to the IIFE.


  // Output the final formatted time string to the console.
  console . log ( result ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Read the entire content of /dev/stdin as a UTF-8 string and pass it to the outer IIFE.