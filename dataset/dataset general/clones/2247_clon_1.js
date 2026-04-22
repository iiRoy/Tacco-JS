/*
 * This file extends JavaScript's String.prototype and Number.prototype
 * to provide a more natural language-like way to work with Moment.js durations.
 * It also extends Moment.js Duration.prototype for convenience.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */

( function ( ) {


  // Initialize the moment.js library.
  // It checks for the global 'window' object to determine the environment (browser vs. Node.js).
  var   mmt   =   'undefined'   !==   typeof   window
    ?   window.moment
    :   require ( 'moment' )
  ; // End of moment.js library initialization


  //***** String-based API *****
  // These methods allow creating Moment.js durations from string descriptions.


  /**
   * Calculates a date/time that is a specified duration *before* a reference date.
   * The string format should be "NUMBER UNITS" (e.g., "5 days").
   *
   * @param {Date|Moment|string|number} ref - The reference date/time.
   * @returns {Date} The resulting Date object.
   */
  String.prototype.before   =
    function   before   (   ref   )
    {
      // Delegate to the internal 'adjust' utility function.
      // The operation is 'subtract' because we're looking for a time 'before'.
      return   adjust   (   ref ,   'subtract' ,   this   )
      ;
    }
  ; // End of String.prototype.before


  /**
   * Calculates a date/time that is a specified duration *after* a reference date.
   * The string format should be "NUMBER UNITS" (e.g., "2 hours").
   *
   * @param {Date|Moment|string|number} ref - The reference date/time.
   * @returns {Date} The resulting Date object.
   */
  String.prototype.after   =
    function   after   (   ref   )
    {
      // Delegate to the internal 'adjust' utility function.
      // The operation is 'add' because we're looking for a time 'after'.
      return   adjust   (   ref ,   'add' ,   this   )
      ;
    }
  ; // End of String.prototype.after


  /**
   * Calculates a date/time that is a specified duration *ago* from the current moment.
   * This is a convenience method that uses the current date as the reference.
   *
   * @returns {Date} The resulting Date object.
   */
  String.prototype.ago   =
    function   ago   (   )
    {
      // Uses 'before' with the current date as the reference.
      return   this.before   (   new   Date   (   )   )
      ;
    }
  ; // End of String.prototype.ago


  /**
   * Calculates a date/time that is a specified duration *from now*.
   * This is a convenience method that uses the current date as the reference.
   *
   * @returns {Date} The resulting Date object.
   */
  String.prototype.fromNow   =
    function   fromNow   (   )
    {
      // Uses 'after' with the current date as the reference.
      return   this.after   (   new   Date   (   )   )
      ;
    }
  ; // End of String.prototype.fromNow


  //***** Number-based API *****
  // These methods allow creating Moment.js durations directly from numbers.


  // Define the units that can be used with numbers (e.g., 5.minutes, 10.days).
  var   units   =   [ 'milliseconds' ,   'seconds' ,   'minutes' ,   'hours' ,   'days' ,   'weeks' ,   'months' ,   'years' ]
  ;


  // Loop through each unit and extend Number.prototype.
  for   (   var   index   =   0 ,   len   =   units.length ;   index   <   len ;   ++index   )
  {
    /* jshint loopfunc: true */
    // Create an IIFE to capture the current 'units' value in the loop.
    (   function   (   currentUnits   )
    {
      // Get the singular form of the unit (e.g., 'milliseconds' -> 'millisecond').
      var   unit   =   currentUnits.slice   (   0 ,   -1   )
      ;

      // Extend Number.prototype with both plural and singular unit names.
      // e.g., 5.minutes and 5.minute will both work.
      Number.prototype[ currentUnits ]   =
        Number.prototype[ unit ]   =
          function   toDuration   (   )
          {
            // Create a moment.duration object using the number's value and the unit.
            return   mmt.duration   (   +this ,   unit   )
            ;
          }
      ; // End of Number.prototype extension for current unit
    }   )   (   units[ index ]   )
    ; // End of inner IIFE for unit processing
  } // End of unit iteration loop


  //***** Moment::Duration-based API *****
  // These methods extend Moment.js Duration objects for more convenient date manipulation.


  // Get the prototype of Moment.js Duration objects to extend it.
  var   target   =   mmt.duration   (   ) . constructor . prototype
  ;


  /**
   * Calculates a date/time that is this duration *before* a reference date.
   * Applied to a Moment.js Duration object.
   *
   * @param {Date|Moment|string|number} ref - The reference date/time.
   * @returns {Date} The resulting Date object.
   */
  target.before   =
    function   before   (   ref   )
    {
      // Create a Moment object from the reference, subtract this duration, and convert to Date.
      return   mmt   (   ref   ) . subtract   (   this   ) . toDate   (   )
      ;
    }
  ; // End of Moment.Duration.prototype.before


  /**
   * Calculates a date/time that is this duration *after* a reference date.
   * Applied to a Moment.js Duration object.
   *
   * @param {Date|Moment|string|number} ref - The reference date/time.
   * @returns {Date} The resulting Date object.
   */
  target.after   =
    function   after   (   ref   )
    {
      // Create a Moment object from the reference, add this duration, and convert to Date.
      return   mmt   (   ref   ) . add   (   this   ) . toDate   (   )
      ;
    }
  ; // End of Moment.Duration.prototype.after


  /**
   * Calculates a date/time that is this duration *ago* from the current moment.
   * Applied to a Moment.js Duration object.
   *
   * @returns {Date} The resulting Date object.
   */
  target.ago   =
    function   ago   (   )
    {
      // Use the current moment, subtract this duration, and convert to Date.
      return   mmt   (   ) . subtract   (   this   ) . toDate   (   )
      ;
    }
  ; // End of Moment.Duration.prototype.ago


  /**
   * Calculates a date/time that is this duration *from now*.
   * Applied to a Moment.js Duration object.
   *
   * @returns {Date} The resulting Date object.
   */
  target.fromNow   =
    function   fromNow   (   )
    {
      // Use the current moment, add this duration, and convert to Date.
      return   mmt   (   ) . add   (   this   ) . toDate   (   )
      ;
    }
  ; // End of Moment.Duration.prototype.fromNow


  //***** Internal utilities *****
  // Helper functions used by the API methods.


  // Link to Moment.js documentation for reference on duration formats.
  var   MOMENT_DOC   =   'http://momentjs.com/docs/#/manipulating/add/'
  ;


  /**
   * Internal helper function to adjust a reference date by a specified duration string.
   *
   * @param {Date|Moment|string|number} ref - The reference date/time.
   * @param {string} op - The operation to perform ('add' or 'subtract').
   * @param {string} str - The duration string (e.g., "5 days").
   * @returns {Date} The resulting Date object.
   * @throws {string} If the duration string format is invalid.
   */
  function   adjust   (   ref ,   op ,   str   )
  {
    // Regular expression to parse the duration string into number and units.
    var   m   =   str.match   (   /^\s*(\d+|\d*\.\d+)\s*([a-z]+)\s*$/i   )
    ;

    // If the string does not match the expected "NUMBER UNITS" format, throw an error.
    if   (   !m   )
    {
      throw   'Invalid descriptor: '   +   str   +   '.  Must be of the "NUMBER UNITS" form. See '   +   MOMENT_DOC
      ;
    }

    // Create a Moment object from the reference, apply the operation with parsed units and value,
    // then convert the result back to a standard Date object.
    return   mmt   (   ref   ) [ op ]   (   m[ 2 ] ,   m[ 1 ]   ) . toDate   (   )
    ;
  } // End of adjust utility function


} ) ( )
; // End of IIFE (Immediately Invoked Function Expression)