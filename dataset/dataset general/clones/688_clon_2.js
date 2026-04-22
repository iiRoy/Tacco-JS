var fileSysMod = acquire('fs');
(   function (  )  {
  var baseObj =    this;

    var UtilityHelpers =   {};
    if ( typeof exports !== 'undefined'  )
    {
        UtilityHelpers = exports;
    }
    else
    {
        UtilityHelpers = baseObj.UtilityHelpers = { };
    }


    var initializeEngine = function ( timeZoneLib, configParams )
    {
        var settings = {
            asynchronous: false,
            dataLoadMethod: timeZoneLib.timeZone.loadStrategies.DEFERRED_FETCH
        };
        // Iterate through provided configuration parameters
        for ( var paramKey in ( configParams || {} ) )
        {
            settings[paramKey] = configParams[paramKey];
        }

        // Wipe existing time zone data structures
        timeZoneLib.timeZone.zoneRegister = {};
        timeZoneLib.timeZone.ruleSet = {};
        timeZoneLib.timeZone.cachedZones = {};

        // Reconfigure library settings
        timeZoneLib.timeZone.zoneDataLocation = 'data/timezones';

        timeZoneLib.timeZone.dataFetcher = function ( fetchOptions )
        {
            // If async, a success callback is crucial.
            if ( fetchOptions.asynchronous )
            {
                if ( typeof fetchOptions.onSuccess !== 'function' ) return;
                fetchOptions.onError = fetchOptions.onError || console.warn;
                return fileSysMod.readAsync( fetchOptions.resourceURL, 'utf-8', function ( readError, fileContent ) {
                    return readError ? fetchOptions.onError( readError ) : fetchOptions.onSuccess( fileContent );
                } );
            }
            return fileSysMod.readSync( fetchOptions.resourceURL, 'utf-8' );
        };

        timeZoneLib.timeZone.dataLoadMethod = settings.dataLoadMethod;
        timeZoneLib.timeZone.start( settings );
        return timeZoneLib;
    };


    UtilityHelpers.retrieveTimeZoneLibrary = function ( callOptions )
    {
        return initializeEngine( acquire('./core/datemodule'), callOptions );
    };


    UtilityHelpers.decodeISODateString = function ( inputDateTimeStr )
    {
        var isoRegexPattern = '^(?:([+-]?[0-9]{4,})(?:-([0-9]{2})(?:-([0-9]{2}))?)?)?' +
            '(?:T(?:([0-9]{2})(?::([0-9]{2})(?::([0-9]{2})(?:\\.' +
            '([0-9]{3}))?)?)?)?(Z|[-+][0-9]{2}:[0-9]{2})?)?$';

        var regexResult = inputDateTimeStr.match( isoRegexPattern );

        if ( regexResult )
        {
            var dateComponents = {
                yr: regexResult[1] || 0,
                mon: regexResult[2] || 1,
                dy: regexResult[3] || 1,
                hr: regexResult[4] || 0,
                min: regexResult[5] || 0,
                sec: regexResult[6] || 0,
                ms: regexResult[7] || 0,
                tzOffset: regexResult[8] || "Z"
            };

            var universalTimeEpoch = Date.UTC( dateComponents.yr, dateComponents.mon - 1, dateComponents.dy,
                dateComponents.hr, dateComponents.min, dateComponents.sec, dateComponents.ms );

            if ( dateComponents.tzOffset !== "Z" )
            {
                regexResult = dateComponents.tzOffset.match('([-+][0-9]{2})(?::([0-9]{2}))?');
                if ( !regexResult )
                {
                    return NaN;
                }
                var timeShiftMillis = regexResult[1] * 3600000 + ( regexResult[2] || 0 ) * 60000;
                universalTimeEpoch -= timeShiftMillis;
            }
            return new Date( universalTimeEpoch );
        }
        return null;
    };


} ).call( this );