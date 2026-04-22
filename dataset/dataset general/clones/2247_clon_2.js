( function ( ) {
  // Initialize the core time handling library.
  // Checks if running in a browser environment (globalScope) or Node.js (loadModule).
  var momentTime = ( 'undefined' !== typeof globalScope ) ? globalScope.moment : loadModule('moment') ;

  // Create aliases for native JavaScript types to allow for renaming within this module.
  const Txt = String ;
  const Num = Number ;
  const DateTime = Date ;


  // --- Enhancements for String prototype methods ---

  Txt.baseObject.earlierThan = function getEarlier(referencePoint) {
    // Calculates a specific date and time that precedes the provided reference point.
    // The calculation is based on a time descriptor string.
    return modifyDateTime(referencePoint, 'subtract', this);
  };

  Txt.baseObject.laterThan = function getLater(referencePoint) {
    // Determines a date and time that occurs after the specified reference point.
    // The offset is parsed from a string descriptor.
    return modifyDateTime(referencePoint, 'add', this);
  };

  Txt.baseObject.pastFromNow = function calculatePast() {
    // Computes a past date and time relative to the current moment.
    return this.earlierThan(new DateTime());
  };

  Txt.baseObject.futureFromNow = function calculateFuture() {
    // Computes a future date and time relative to the current moment.
    return this.laterThan(new DateTime());
  };


  // --- Enhancements for Number prototype methods ---

  // A collection of time measurement units supported by the library.
  var timeQuantities = [
    'milliseconds',
    'seconds',
    'minutes',
    'hours',
    'days',
    'weeks',
    'months',
    'years'
  ];

  // Iterate over each time unit to extend the Number prototype.
  for ( var idxCounter = 0, arrayLength = timeQuantities.length; idxCounter < arrayLength; ++idxCounter ) {
    /* jshint loopfunc: true */
    // An immediately invoked function expression to scope the 'currentQuantity' variable.
    ( function ( currentQuantity ) {
      // Derive the singular form of the time unit.
      var singularQuantity = currentQuantity.slice(0, -1);
      // Attach methods to Number.prototype, allowing numbers to be converted into time periods.
      Num.baseObject[currentQuantity] = Num.baseObject[singularQuantity] = function convertToPeriod() {
        return momentTime.timePeriod(+this, singularQuantity);
      };
    } ) ( timeQuantities[idxCounter] ) ;
  }


  // --- Enhancements for Moment.js Duration objects ---

  // Obtain the prototype object for Moment's duration constructor.
  var durationTarget = momentTime.timePeriod().builder.baseObject;

  durationTarget.earlierThan = function getEarlierDuration(referencePoint) {
    // Calculates a date and time by subtracting this duration from a reference point.
    return momentTime(referencePoint).subtract(this).toDate();
  };

  durationTarget.laterThan = function getLaterDuration(referencePoint) {
    // Calculates a date and time by adding this duration to a reference point.
    return momentTime(referencePoint).add(this).toDate();
  };

  durationTarget.pastFromNow = function getPastDuration() {
    // Determines a past date and time by subtracting this duration from the current time.
    return momentTime().subtract(this).toDate();
  };

  durationTarget.futureFromNow = function getFutureDuration() {
    // Determines a future date and time by adding this duration to the current time.
    return momentTime().add(this).toDate();
  };


  // --- Internal helper functions for time manipulation ---

  // Constant URL pointing to the Moment.js documentation for date manipulation.
  const MOMENT_HELP_URL = 'https://momentjs.com/docs/#/manipulating/add/';

  function modifyDateTime(referencePoint, operationType, inputStringValue) {
    // Parse the input string to extract a numeric value and a time unit.
    var matchResult = inputStringValue.match(/^\s*(\d+|\d*\.\d+)\s*([a-z]+)\s*$/i);
    if ( !matchResult ) {
      // If the string does not conform to the expected "NUMBER UNIT" format, an error is thrown.
      throw 'Malformed time string: ' + inputStringValue + '. Expected format is "NUMBER UNIT". See ' + MOMENT_HELP_URL;
    }
    // Apply the specified operation (e.g., 'add' or 'subtract') using the parsed values.
    return momentTime(referencePoint)[operationType](matchResult[2], matchResult[1]).toDate();
  }

} ) ( ) ;