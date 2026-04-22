(function() {
  // A utility to acquire the 'moment' library, handling different environments.
  // This ensures the core dependency is available before extending prototypes.
  let timeCoreLib;
  if (typeof window !== 'undefined' && typeof window.moment !== 'undefined') {
    timeCoreLib = window.moment; // Browser global
  } else if (typeof require === 'function') {
    try {
      timeCoreLib = require('moment'); // Node.js module
    } catch (importError) {
      console.error("Failed to load Moment.js library via require(). Error:", importError.message);
      return; // Abort if critical dependency is missing.
    }
  } else {
    console.error("Moment.js library is not found in global scope or via require().");
    return; // Essential library is unavailable.
  }

  // *******************************************************************
  //  --- Enhancements for String Prototypes: Interpreting Time Phrases ---
  // *******************************************************************

  /**
   * Parses a time descriptor string (e.g., "5 days", "3.5 hours") and
   * applies an arithmetic operation ('add' or 'subtract') to a reference date.
   * Returns a moment object after the operation, not a raw Date.
   *
   * @param {Date|string|number|Moment} initialReference The starting point for calculation.
   * @param {string} operationKind The type of operation: 'add' or 'subtract'.
   * @param {string} durationText A string representing the duration.
   * @returns {Moment} A moment object representing the adjusted time.
   * @throws {Error} If the durationText is invalid or operationKind is unknown.
   */
  function processTemporalDelta(initialReference, operationKind, durationText) {
    if (typeof durationText !== 'string' || durationText.trim().length === 0) {
      throw new Error("Duration descriptor must be a non-empty string.");
    }
    const parseResult = durationText.trim().match(/^\s*(\d+(\.\d+)?)\s*([a-z]+)\s*$/i);
    if (!parseResult) {
      throw new Error(`Cannot interpret time phrase: "${durationText}". Expected "NUMBER UNIT" format.`);
    }

    const quantityValue = parseFloat(parseResult[1]);
    const unitIdentifier = parseResult[3];

    // Validate the requested operation type.
    if (!['add', 'subtract'].includes(operationKind)) {
      throw new Error(`Unsupported temporal operation: "${operationKind}". Use 'add' or 'subtract'.`);
    }

    // Use the acquired moment library to perform the calculation.
    return timeCoreLib(initialReference)[operationKind](quantityValue, unitIdentifier);
  }

  // Attaching new methods to the native String prototype.
  // These methods allow strings like "3 days" to modify dates.

  Object.defineProperties(String.prototype, {
    // Calculates a date that comes before the reference date by this string's duration.
    'precede': {
      value: function(referencePoint) {
        // Ensure the context ('this') is robustly converted to a string.
        const currentDescriptor = String(this);
        return processTemporalDelta(referencePoint, 'subtract', currentDescriptor).toDate();
      },
      writable: true, configurable: true
    },

    // Calculates a date that comes after the reference date by this string's duration.
    'follow': {
      value: function(referencePoint) {
        const currentDescriptor = String(this);
        return processTemporalDelta(referencePoint, 'add', currentDescriptor).toDate();
      },
      writable: true, configurable: true
    },

    // Determines a past date relative to the current moment based on this string's duration.
    'earlier': {
      value: function() {
        const now = timeCoreLib(); // Get the current moment.
        return this.precede(now); // Delegate to the 'precede' method.
      },
      writable: true, configurable: true
    },

    // Determines a future date relative to the current moment based on this string's duration.
    'later': {
      value: function() {
        const now = timeCoreLib(); // Get the current moment.
        return this.follow(now); // Delegate to the 'follow' method.
      },
      writable: true, configurable: true
    }
  });


  // *******************************************************************
  //  --- Enhancements for Number Prototypes: Creating Durations ---
  // *******************************************************************

  // List of standard time units recognized by moment.js for durations.
  const temporalQuantifiers = [
    'milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'
  ];

  /**
   * Helper function to dynamically add duration creation methods
   * to the Number.prototype for both plural and singular unit names.
   * @param {string} fullUnit The plural form of the time unit (e.g., 'seconds').
   */
  function attachDurationCreatorToNumber(fullUnit) {
    const singleUnit = fullUnit.slice(0, -1); // 'seconds' -> 'second'

    const durationMethod = function() {
      // Ensure 'this' is a valid number before using it as a duration value.
      const numericValue = Number(this);
      if (isNaN(numericValue)) {
        throw new TypeError("Cannot create a duration from a non-numeric value.");
      }
      return timeCoreLib.duration(numericValue, singleUnit);
    };

    // Assign the method to both plural and singular forms for user convenience.
    Object.defineProperty(Number.prototype, fullUnit, {
      value: durationMethod,
      writable: true, configurable: true
    });
    Object.defineProperty(Number.prototype, singleUnit, {
      value: durationMethod,
      writable: true, configurable: true
    });
  }

  // Iterate through all defined temporal quantifiers and extend Number.prototype.
  for (let idx = 0; idx < temporalQuantifiers.length; ++idx) {
    attachDurationCreatorToNumber(temporalQuantifiers[idx]);
  }


  // *******************************************************************
  //  --- Enhancements for Moment.Duration Prototypes: Applying Durations ---
  // *******************************************************************

  // Obtain the prototype object for all moment.duration instances.
  const momentDurationExtensionTarget = timeCoreLib.duration().constructor.prototype;

  // Add methods to Moment.duration objects to calculate specific dates
  // relative to a given reference point.

  Object.defineProperties(momentDurationExtensionTarget, {
    // Computes a Date object representing a time point before the reference.
    'offsetBefore': {
      value: function(baseMoment) {
        // Ensure baseMoment is a valid moment object or can be converted.
        const effectiveBase = timeCoreLib.isMoment(baseMoment) ? baseMoment : timeCoreLib(baseMoment);
        if (!effectiveBase.isValid()) {
          throw new TypeError("Invalid base moment provided for offsetBefore.");
        }
        return effectiveBase.subtract(this).toDate();
      },
      writable: true, configurable: true
    },

    // Computes a Date object representing a time point after the reference.
    'offsetAfter': {
      value: function(baseMoment) {
        const effectiveBase = timeCoreLib.isMoment(baseMoment) ? baseMoment : timeCoreLib(baseMoment);
        if (!effectiveBase.isValid()) {
          throw new TypeError("Invalid base moment provided for offsetAfter.");
        }
        return effectiveBase.add(this).toDate();
      },
      writable: true, configurable: true
    },

    // Calculates a Date object in the past relative to the current time.
    'fromCurrentPast': {
      value: function() {
        // Use the current moment as the reference point.
        return timeCoreLib().subtract(this).toDate();
      },
      writable: true, configurable: true
    },

    // Calculates a Date object in the future relative to the current time.
    'fromCurrentFuture': {
      value: function() {
        // Use the current moment as the reference point.
        return timeCoreLib().add(this).toDate();
      },
      writable: true, configurable: true
    }
  });

  // End of the module's scope.
})();