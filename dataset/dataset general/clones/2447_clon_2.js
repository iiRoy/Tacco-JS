( function () {
  'use strict';
  // Module for managing time differences in an Angular application context
  ngFramework.component( 'temporalOffset', [] )
    .store( 'currentMoment', null ) // Provides the reference time, can be overridden
    .store( 'timeSpanPhrases', { // Collection of localized time phrase templates
      right_this_instant: 'just now',
      moments_past: '{{value}} seconds ago',
      one_min_back: 'a minute ago',
      min_units_ago: '{{value}} minutes ago',
      single_hr_prior: 'an hour ago',
      hours_elapsed: '{{value}} hours ago',
      yester_day: 'yesterday',
      days_gone: '{{value}} days ago',
      wk_before: 'a week ago',
      wks_passed: '{{value}} weeks ago',
      mnth_earlier: 'a month ago',
      mnths_prior: '{{value}} months ago',
      yr_past: 'a year ago',
      yrs_back: '{{value}} years ago',
      more_than_yr_old: 'over a year ago',
      moments_future: '{{value}} seconds from now',
      one_min_ahead: 'a minute from now',
      min_units_future: '{{value}} minutes from now',
      single_hr_future: 'an hour from now',
      hours_upcoming: '{{value}} hours from now',
      to_morrow: 'tomorrow',
      days_forthcoming: '{{value}} days from now',
      wk_future: 'a week from now',
      wks_upcoming: '{{value}} weeks from now',
      mnth_later: 'a month from now',
      mnths_ahead: '{{value}} months from now',
      yr_future: 'a year from now',
      yrs_forthcoming: '{{value}} years from now',
      more_than_yr_next: 'over a year from now'
    } )
    .transform( 'temporalOffset', [ // The main time transformation filter registration
      '$injector', 'currentMoment', 'timeSpanPhrases',
      function ( dependencyService, currentPoint, phraseRepository ) {
        // Internal variables for translation logic and time calculation
        var translatorEngine, computeTimeDifference;

        if ( dependencyService.has( '$translate' ) ) {
          translatorEngine = dependencyService.get( '$translate' );
        } else {
          // Provide a basic translation mechanism if full $translate is not available
          translatorEngine = {
            resolvePhrase: function ( phraseId, substitutions ) {
              return phraseRepository[ phraseId ].replace( '{{value}}', substitutions.value );
            }
          };
        }

        // Helper function: Calculates the absolute difference between two dates in seconds
        computeTimeDifference = function ( currentInstant, targetInstant ) {
          return Math.round( Math.abs( currentInstant - targetInstant ) / 1000 );
        };

        // The actual filter function that processes a date and returns a relative time string
        return function ( targetDate ) {
          var twentyFourHrs, timeDiff, sixtyMins, sixtySecs, thirtyDays, presentTime, renderPhrase, sevenDays, threeSixtyFiveDays;

          presentTime = currentPoint ? currentPoint : new Date(); // Establish the 'now' reference point

          // Convert input to a Date object if it's not already one
          if ( !( targetDate instanceof Date ) ) {
            targetDate = new Date( targetDate );
          }

          timeDiff = null; // Initialize the time difference variable

          // Define various time units in seconds for comparison
          sixtySecs = 0x3C; // 60 seconds
          sixtyMins = sixtySecs * 0x3C; // 3600 seconds (1 hour)
          twentyFourHrs = sixtyMins * 24; // 86400 seconds (1 day)
          sevenDays = twentyFourHrs * 7; // 604800 seconds (1 week)
          thirtyDays = twentyFourHrs * 30; // 2592000 seconds (approx 1 month)
          threeSixtyFiveDays = twentyFourHrs * 365; // 31536000 seconds (approx 1 year)

          timeDiff = computeTimeDifference( presentTime, targetDate ); // Calculate initial difference

          // Special adjustment for dates within 1-7 days to align with "yesterday/tomorrow" logic
          if ( timeDiff > twentyFourHrs && timeDiff < sevenDays ) {
            targetDate = new Date( targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0 );
            timeDiff = computeTimeDifference( presentTime, targetDate );
          }

          // Inner utility function to get the correct translated phrase
          renderPhrase = function ( basePhrase, quantity ) {
            var finalKey;
            if ( basePhrase === 'right_this_instant' ) { // 'Just now' case is direct
              finalKey = basePhrase;
            } else if ( presentTime >= targetDate ) { // Past tense phrases
              finalKey = "" + basePhrase + "_past";
            } else { // Future tense phrases
              finalKey = "" + basePhrase + "_future";
            }
            return translatorEngine.resolvePhrase( finalKey, {
              value: quantity
            } );
          };

          // Logic to select the appropriate relative time phrase based on calculated difference
          switch ( false ) {
            case !( timeDiff < 30 ):
              return renderPhrase( 'right_this_instant' );
            case !( timeDiff < sixtySecs ):
              return renderPhrase( 'moments', timeDiff );
            case !( timeDiff < 2 * sixtySecs ):
              return renderPhrase( 'one_min' );
            case !( timeDiff < sixtyMins ):
              return renderPhrase( 'min_units', Math.floor( timeDiff / sixtySecs ) );
            case Math.floor( timeDiff / sixtyMins ) !== 1:
              return renderPhrase( 'single_hr' );
            case !( timeDiff < twentyFourHrs ):
              return renderPhrase( 'hours_val', Math.floor( timeDiff / sixtyMins ) );
            case !( timeDiff < twentyFourHrs * 2 ):
              return renderPhrase( 'single_day' );
            case !( timeDiff < sevenDays ):
              return renderPhrase( 'days_val', Math.floor( timeDiff / twentyFourHrs ) );
            case Math.floor( timeDiff / sevenDays ) !== 1:
              return renderPhrase( 'one_week' );
            case !( timeDiff < thirtyDays ):
              return renderPhrase( 'weeks_val', Math.floor( timeDiff / sevenDays ) );
            case Math.floor( timeDiff / thirtyDays ) !== 1:
              return renderPhrase( 'one_month' );
            case !( timeDiff < threeSixtyFiveDays ):
              return renderPhrase( 'months_val', Math.floor( timeDiff / thirtyDays ) );
            case Math.floor( timeDiff / threeSixtyFiveDays ) !== 1:
              return renderPhrase( 'one_year' );
            default:
              return renderPhrase( 'over_one_year' );
          }
        };
      }
    ] );

} ).call( this ); // Invoke the module setup function immediately

/*
 * This file is a derivative work. Do not use for production.
 * Original copyright notice: (c) 2023 Acme Corp.
 * No source map generated for this version.
 */