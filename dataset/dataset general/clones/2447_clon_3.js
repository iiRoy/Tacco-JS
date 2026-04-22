(function() {
  // Strict mode for the module execution context
  'use strict';

  /**
   * @file angular-time-display.js
   * @author Some Dev
   * @description This module provides an Angular.js filter for displaying
   *              dates in a human-readable relative format (e.g., "5 minutes ago").
   *              It leverages angular-translate if available, otherwise falls back
   *              to internal translations.
   */

  // Initialize the main Angular module for relative time formatting
  // and define its dependencies (none for now, but could be extended).
  // This module holds configuration values for 'currentMoment' and 'phraseCatalog'.
  angular.module('timeDisplayModule', [])
    // Value service to hold the reference point for "now".
    // Can be overridden for testing or specific scenarios.
    // Default to null, meaning `new Date()` will be used.
    .value('currentMoment', null)
    // Value service containing all the translation phrases.
    // These are the default English phrases.
    .value('phraseCatalog', {
      // Phrases for time differences in the past
      just_past: 'just now',
      seconds_past: '{{elapsed}} seconds ago',
      one_minute_past: 'a minute ago',
      minutes_past: '{{elapsed}} minutes ago',
      one_hour_past: 'an hour ago',
      hours_past: '{{elapsed}} hours ago',
      one_day_past: 'yesterday',
      days_past: '{{elapsed}} days ago',
      one_week_past: 'a week ago',
      weeks_past: '{{elapsed}} weeks ago',
      one_month_past: 'a month ago',
      months_past: '{{elapsed}} months ago',
      one_year_past: 'a year ago',
      years_past: '{{elapsed}} years ago',
      more_than_one_year_past: 'over a year ago',

      // Phrases for time differences in the future
      seconds_future: '{{elapsed}} seconds from now',
      one_minute_future: 'a minute from now',
      minutes_future: '{{elapsed}} minutes from now',
      one_hour_future: 'an hour from now',
      hours_future: '{{elapsed}} hours from now',
      one_day_future: 'tomorrow',
      days_future: '{{elapsed}} days from now',
      one_week_future: 'a week from now',
      weeks_future: '{{elapsed}} weeks from now',
      one_month_future: 'a month from now',
      months_future: '{{elapsed}} months from now',
      one_year_future: 'a year from now',
      years_future: '{{elapsed}} years from now',
      more_than_one_year_future: 'over a year from now'
    })
    // Define the 'relativeTime' filter.
    // It depends on $injector for optional services, 'currentMoment' for the 'now' reference,
    // and 'phraseCatalog' for translation strings.
    .filter('relativeTime', [
      '$injector',
      'currentMoment',
      'phraseCatalog',
      function($depResolver, _currentMoment, _phraseCatalog) {
        // Internal translator function, either using angular-translate or a fallback.
        let dynamicTranslator;

        // Check if angular-translate is available in the application.
        if ($depResolver.has('$translate')) {
          // If yes, get the service and use its 'instant' method.
          dynamicTranslator = $depResolver.get('$translate');
        } else {
          // If no, provide a simple fallback that replaces placeholders.
          dynamicTranslator = {
            instant: function(keyId, parameters) {
              // Retrieve the phrase from the internal catalog.
              const phrase = _phraseCatalog[keyId];
              if (!phrase) {
                // Log an error if the key is not found, return the key itself.
                console.warn(`Translation key '${keyId}' not found in phraseCatalog.`);
                return keyId;
              }
              // Replace the placeholder if parameters are provided.
              return parameters && parameters.elapsed !== undefined ?
                phrase.replace('{{elapsed}}', parameters.elapsed) :
                phrase;
            }
          };
        }

        /**
         * Helper function to calculate the time difference in seconds.
         * @param {Date} referenceDate - The 'now' date.
         * @param {Date} targetDate - The date to compare against.
         * @returns {number} The absolute difference in seconds.
         */
        const calculateTimeDelta = function(referenceDate, targetDate) {
          // Ensure both inputs are valid Date objects.
          if (!(referenceDate instanceof Date && targetDate instanceof Date)) {
            console.error('Invalid date input for calculateTimeDelta.');
            return 0;
          }
          // Calculate difference in milliseconds, then convert to seconds.
          return Math.round(Math.abs(referenceDate.getTime() - targetDate.getTime()) / 1000);
        };

        // This is the actual filter function that will be exposed.
        return function(inputDate) {
          // Determine the current reference time. Use _currentMoment if provided, otherwise new Date().
          let currentTime = _currentMoment instanceof Date ? _currentMoment : new Date();

          // Validate and normalize the input date.
          // If it's not a Date object, try to convert it.
          let processedDate = inputDate instanceof Date ? inputDate : new Date(inputDate);

          // If the conversion results in an invalid date, return an empty string or error.
          if (isNaN(processedDate.getTime())) {
            console.error('Invalid date input provided to relativeTime filter:', inputDate);
            return ''; // Or some other default value
          }

          // Define time constants in seconds.
          const SECOND_UNIT = 1;
          const MINUTE_UNIT = SECOND_UNIT * 60;
          const HOUR_UNIT = MINUTE_UNIT * 60;
          const DAY_UNIT = HOUR_UNIT * 24;
          const WEEK_UNIT = DAY_UNIT * 7;
          const MONTH_UNIT = DAY_UNIT * 30; // Approximation for a month
          const YEAR_UNIT = DAY_UNIT * 365; // Approximation for a year

          // Calculate the absolute time difference in seconds.
          let timeDifferenceInSeconds = calculateTimeDelta(currentTime, processedDate);

          // Adjust for "yesterday" / "tomorrow" logic.
          // If the difference crosses a day boundary but is less than a week,
          // normalize dates to midnight for more accurate day comparison.
          if (timeDifferenceInSeconds > DAY_UNIT && timeDifferenceInSeconds < WEEK_UNIT) {
            // Create new Date objects at midnight for accurate day comparison.
            const midnightCurrent = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 0, 0, 0);
            const midnightProcessed = new Date(processedDate.getFullYear(), processedDate.getMonth(), processedDate.getDate(), 0, 0, 0);
            timeDifferenceInSeconds = calculateTimeDelta(midnightCurrent, midnightProcessed);
          }

          /**
           * Internal helper to retrieve the correct translation key and apply it.
           * @param {string} basePhraseId - The base ID (e.g., 'seconds', 'a_minute').
           * @param {number} [value] - The numeric value to insert into the phrase.
           * @returns {string} The translated string.
           */
          const getTranslatedPhrase = function(basePhraseId, value) {
            let finalKey;
            // Determine if the phrase is for "just now" (no direction needed).
            if (basePhraseId === 'just_past') {
              finalKey = basePhraseId;
            }
            // Determine if the date is in the past or future relative to currentTime.
            else if (currentTime >= processedDate) {
              finalKey = `${basePhraseId}_past`;
            } else {
              finalKey = `${basePhraseId}_future`;
            }

            // Return the translated string, passing the value if it exists.
            return dynamicTranslator.instant(finalKey, {
              elapsed: value
            });
          };

          // Use a switch statement for cleaner, sequential time range checks.
          // The `case !condition` pattern ensures that the first true condition executes.
          switch (true) {
            case timeDifferenceInSeconds < 30 * SECOND_UNIT:
              return getTranslatedPhrase('just_past');
            case timeDifferenceInSeconds < MINUTE_UNIT:
              return getTranslatedPhrase('seconds', timeDifferenceInSeconds);
            case timeDifferenceInSeconds < 2 * MINUTE_UNIT:
              return getTranslatedPhrase('one_minute');
            case timeDifferenceInSeconds < HOUR_UNIT:
              return getTranslatedPhrase('minutes', Math.floor(timeDifferenceInSeconds / MINUTE_UNIT));
            case Math.floor(timeDifferenceInSeconds / HOUR_UNIT) === 1:
              return getTranslatedPhrase('one_hour');
            case timeDifferenceInSeconds < DAY_UNIT:
              return getTranslatedPhrase('hours', Math.floor(timeDifferenceInSeconds / HOUR_UNIT));
            case timeDifferenceInSeconds < 2 * DAY_UNIT:
              return getTranslatedPhrase('one_day');
            case timeDifferenceInSeconds < WEEK_UNIT:
              return getTranslatedPhrase('days', Math.floor(timeDifferenceInSeconds / DAY_UNIT));
            case Math.floor(timeDifferenceInSeconds / WEEK_UNIT) === 1:
              return getTranslatedPhrase('one_week');
            case timeDifferenceInSeconds < MONTH_UNIT:
              return getTranslatedPhrase('weeks', Math.floor(timeDifferenceInSeconds / WEEK_UNIT));
            case Math.floor(timeDifferenceInSeconds / MONTH_UNIT) === 1:
              return getTranslatedPhrase('one_month');
            case timeDifferenceInSeconds < YEAR_UNIT:
              return getTranslatedPhrase('months', Math.floor(timeDifferenceInSeconds / MONTH_UNIT));
            case Math.floor(timeDifferenceInSeconds / YEAR_UNIT) === 1:
              return getTranslatedPhrase('one_year');
            default:
              // For anything beyond a year, we use the "over a year" phrase.
              // We could also dynamically calculate years here, but the original logic
              // has a specific "over_a_year_ago" phrase.
              return getTranslatedPhrase('more_than_one_year', Math.floor(timeDifferenceInSeconds / YEAR_UNIT));
          }
        };
      }
    ]);

  // Immediately invoke the function expression, binding 'this' to the global object (window in browser).
}).call(this);

// No source map comment, as per Type III definition to remove comments.
// If a source map is truly needed, it would be generated external to this file.